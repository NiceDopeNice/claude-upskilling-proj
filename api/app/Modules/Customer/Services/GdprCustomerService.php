<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/GdprCustomerService.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Services;

use App\Modules\Customer\Enums\GdprExclusionType;
use App\Modules\Customer\Enums\GdprStatus;
use App\Modules\Customer\Models\CustomerProfile;
use App\Modules\Customer\Models\CustomerProfileExtra;
use App\Modules\Customer\Models\CustomerReminder;
use App\Modules\Customer\Repository\Contracts\GdprCustomerRepositoryInterface;
use App\Modules\Customer\Services\Contracts\GdprCustomerServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class GdprCustomerService implements GdprCustomerServiceInterface
{
    public function __construct(
        private readonly GdprCustomerRepositoryInterface $repository
    ) {}

    /**
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->listing($params);
    }

    /**
     * @param int $customerId
     * @param string $exclusionType
     * @return array
     */
    public function flag(int $customerId, string $exclusionType): array
    {
        $existing = $this->repository->findByCustomerId($customerId);

        // Locked statuses (PendingReview, Anonymized) cannot be re-flagged
        if ($existing && $existing->status->isLocked()) {
            return ['success' => false, 'message' => 'Customer GDPR record is locked and cannot be modified.'];
        }

        if (!CustomerProfile::where('to_user', $customerId)->exists()) {
            return ['success' => false, 'message' => 'Customer not found.'];
        }

        $data = [
            'customer_id'    => $customerId,
            'status'         => GdprStatus::Flagged->value,
            'exclusion_type' => $exclusionType,
            'flagged_at'     => now(),
        ];

        if ($existing) {
            $this->repository->update($existing, $data);
            $record = $existing->fresh();
        } else {
            $record = $this->repository->create($data);
        }

        // Block GDPR contact on the profile extras to prevent further communication
        CustomerProfileExtra::updateOrCreate(['customer_id' => $customerId], ['block_gdpr' => true]);

        // Deactivate all active reminders — they must not fire while flagged
        CustomerReminder::where('customer_id', $customerId)
            ->where('is_active', true)
            ->update(['is_active' => false, 'deactivated_at' => now(), 'deactivated_reason' => 'gdpr_flag']);

        return ['success' => true, 'data' => $record];
    }

    /**
     * @param int $customerId
     * @return bool
     */
    public function unflag(int $customerId): bool
    {
        $record = $this->repository->findByCustomerId($customerId);
        if (!$record) return false;

        $this->repository->delete($record);
        CustomerProfileExtra::where('customer_id', $customerId)->update(['block_gdpr' => false]);

        return true;
    }

    /**
     * @param int $customerId
     * @return array
     */
    public function anonymize(int $customerId): array
    {
        $record = $this->repository->findByCustomerId($customerId);
        if (!$record) return ['success' => false, 'message' => 'No GDPR record found for this customer.'];

        if (!in_array($record->status, [GdprStatus::Flagged, GdprStatus::PendingReview])) {
            return ['success' => false, 'message' => 'Customer must be in Flagged or Pending Review status to anonymize.'];
        }

        $profile = CustomerProfile::where('to_user', $customerId)->first();
        if ($profile) {
            $profile->update([
                'last_name'         => $this->maskInitial($profile->last_name),
                'adress'            => $this->maskInitial($profile->adress),
                'pers_nr'           => '***-****',
                'tel'               => '***',
                'alternative_tel'   => $profile->alternative_tel ? '***' : null,
                'email'             => $this->maskEmail($profile->email),
                'alternative_email' => $profile->alternative_email ? $this->maskEmail($profile->alternative_email) : null,
            ]);
        }

        $this->repository->update($record, ['status' => GdprStatus::Anonymized->value]);

        return ['success' => true, 'data' => $record->fresh()];
    }

    /**
     * @param int $customerId
     * @return array
     */
    public function restore(int $customerId): array
    {
        $record = $this->repository->findByCustomerId($customerId);
        if (!$record) return ['success' => false, 'message' => 'No GDPR record found for this customer.'];
        if ($record->status !== GdprStatus::Anonymized) return ['success' => false, 'message' => 'Customer must be Anonymized to restore.'];
        if (!$record->backup_data) return ['success' => false, 'message' => 'No backup available for restore.'];

        $backup = json_decode(\Illuminate\Support\Facades\Crypt::decryptString($record->backup_data), true);

        CustomerProfile::where('to_user', $customerId)->update(array_filter([
            'first_name' => $backup['first_name'] ?? null, 'last_name' => $backup['last_name'] ?? null,
            'email' => $backup['email'] ?? null, 'alternative_email' => $backup['alternative_email'] ?? null,
            'tel' => $backup['tel'] ?? null, 'alternative_tel' => $backup['alternative_tel'] ?? null,
            'pers_nr' => $backup['pers_nr'] ?? null, 'adress' => $backup['adress'] ?? null,
            'post_nr' => $backup['post_nr'] ?? null, 'ort' => $backup['ort'] ?? null,
        ], fn($v) => $v !== null));

        $this->repository->update($record, ['status' => GdprStatus::Restored->value]);

        return ['success' => true, 'data' => $record->fresh()];
    }

    /**
     * @param int $customerId
     * @return array
     */
    public function reject(int $customerId): array
    {
        $record = $this->repository->findByCustomerId($customerId);
        if (!$record) return ['success' => false, 'message' => 'No GDPR record found for this customer.'];

        $this->repository->update($record, ['status' => GdprStatus::Rejected->value]);

        return ['success' => true, 'data' => $record->fresh()];
    }

    /**
     * @param string $action
     * @param array $customerIds
     * @return array
     */
    public function bulkAction(string $action, array $customerIds): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($customerIds as $customerId) {
            $result = match ($action) {
                // flag requires an exclusion_type — use the dedicated endpoint
                'flag'      => ['success' => false, 'message' => 'Use the flag endpoint with exclusion type.'],
                'unflag'    => ['success' => $this->unflag((int) $customerId)],
                'anonymize' => $this->anonymize((int) $customerId),
                'restore'   => $this->restore((int) $customerId),
                'reject'    => $this->reject((int) $customerId),
                default     => ['success' => false, 'message' => 'Unknown action.'],
            };

            if ($result['success']) { $results['success']++; }
            else { $results['failed']++; $results['errors'][] = ['customer_id' => $customerId, 'message' => $result['message'] ?? 'Failed']; }
        }

        return $results;
    }

    /**
     * @return array
     */
    public function exclusionTypes(): array
    {
        return array_map(fn(GdprExclusionType $t) => ['value' => $t->value, 'label' => $t->label()], GdprExclusionType::cases());
    }

    /**
     * @param string|null $value
     * @return string|null
     */
    private function maskInitial(?string $value): ?string
    {
        if (!$value) return $value;
        return mb_substr($value, 0, 1) . '***';
    }

    /**
     * @param string|null $email
     * @return string|null
     */
    private function maskEmail(?string $email): ?string
    {
        if (!$email) return $email;
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');
        $maskedLocal  = mb_substr($local, 0, 1) . str_repeat('*', max(3, mb_strlen($local) - 1));
        $maskedDomain = mb_substr($domain, 0, 1) . str_repeat('*', max(3, mb_strlen($domain) - 1));
        return "{$maskedLocal}@{$maskedDomain}";
    }
}


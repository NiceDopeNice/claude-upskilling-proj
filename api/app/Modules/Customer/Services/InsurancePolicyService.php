<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/InsurancePolicyService.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Services;

use App\Modules\Customer\Models\InsurancePolicy;
use App\Modules\Customer\Repository\Contracts\InsurancePolicyRepositoryInterface;
use App\Modules\Customer\Services\Contracts\InsurancePolicyExternalApiInterface;
use App\Modules\Customer\Services\Contracts\InsurancePolicyServiceInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class InsurancePolicyService implements InsurancePolicyServiceInterface
{
    public function __construct(
        private readonly InsurancePolicyRepositoryInterface $repository,
        private readonly InsurancePolicyExternalApiInterface $externalApi
    ) {}

    /**
     * @param int $customerId
     * @return Collection
     */
    public function listByCustomer(int $customerId): Collection
    {
        return $this->repository->getByCustomer($customerId);
    }

    /**
     * Creates a local record and registers with the external provider in one transaction.
     * If the external API call fails, the DB write is rolled back.
     *
     * @param int $customerId
     * @param array $data
     * @return array{success: bool, policy: InsurancePolicy|null, message: string}
     */
    public function create(int $customerId, array $data): array
    {
        try {
            $policy = DB::transaction(function () use ($customerId, $data) {
                $policy = $this->repository->create(array_merge($data, [
                    'id'                => Str::random(22),
                    'customer_id'       => $customerId,
                    'partner_reference' => (string) $customerId,
                    'status'            => 'ACTIVE',
                    'source'            => 'manual',
                ]));

                // Remote call must succeed — any failure triggers a rollback
                $result = $this->externalApi->registerPolicy([
                    'customer_id' => $customerId,
                    'product'     => $data['product'] ?? null,
                    'start_date'  => $data['start_date'] ?? null,
                    'policy_id'   => $policy->id,
                ]);

                if (!$result['success']) {
                    throw new Exception($result['message'] ?? 'External provider rejected the policy.');
                }

                return $policy;
            });

            return ['success' => true, 'policy' => $policy->fresh(), 'message' => 'Policy created successfully.'];
        } catch (Exception $e) {
            return ['success' => false, 'policy' => null, 'message' => $e->getMessage()];
        }
    }

    /**
     * Cancels a policy locally and notifies the external provider in one transaction.
     *
     * @param int $customerId
     * @param string $policyId
     * @param string $reason
     * @return array{success: bool, policy: InsurancePolicy|null, message: string}
     */
    public function cancel(int $customerId, string $policyId, string $reason): array
    {
        $policy = $this->repository->findActiveByIdAndCustomer($policyId, $customerId);

        if (!$policy) {
            return ['success' => false, 'policy' => null, 'message' => 'Policy not found or already cancelled.'];
        }

        try {
            DB::transaction(function () use ($policy, $reason) {
                $this->repository->update($policy->id, [
                    'status'       => 'CANCELED',
                    'cancel_reason' => $reason,
                    'cancelled_at' => now(),
                ]);

                // Remote cancellation must succeed — any failure triggers a rollback
                $result = $this->externalApi->cancelPolicy($policy->id, $reason);

                if (!$result['success']) {
                    throw new Exception($result['message'] ?? 'External provider rejected the cancellation.');
                }
            });

            return ['success' => true, 'policy' => $policy->fresh(), 'message' => 'Policy cancelled successfully.'];
        } catch (Exception $e) {
            return ['success' => false, 'policy' => null, 'message' => $e->getMessage()];
        }
    }
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/CustomerRepository.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Repository;

use App\Modules\Customer\Models\CustomerChange;
use App\Modules\Customer\Models\CustomerProfile;
use App\Modules\Customer\Models\CustomerProfileExtra;
use App\Modules\Customer\Repository\Contracts\CustomerRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CustomerRepository implements CustomerRepositoryInterface
{
    public function __construct(
        private readonly CustomerProfile $model
    ) {}

    /**
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function listing(array $params): LengthAwarePaginator
    {
        $perPage = (int) ($params['per_page'] ?? 50);
        $page    = (int) ($params['page'] ?? 1);
        $ids     = array_values(array_filter(array_map('intval', $params['ids'] ?? [])));
        $filters = $params['filters'] ?? [];
        $search  = trim($params['search'] ?? '');
        $field   = $params['field'] ?? '';
        $fields  = array_filter($params['fields'] ?? []);

        // JOIN extras to expose block_gdpr and other flags on the listing
        $query = DB::table('customer_profile as cp')
            ->leftJoin('customer_profile_extras as cpe', 'cpe.customer_id', '=', 'cp.to_user')
            ->select([
                'cp.to_user', 'cp.first_name', 'cp.last_name', 'cp.email',
                'cp.tel', 'cp.pers_nr', 'cp.adress', 'cp.ort',
                DB::raw('NULL as sinfrid_id'),
                DB::raw('(SELECT MAX(o.date_added) FROM orders o WHERE o.by_user = cp.to_user) as last_order_date'),
            ]);

        if (!empty($ids)) {
            $idsString = implode(',', $ids);
            // Preserve the caller-supplied order when fetching by explicit IDs
            $query->whereIn('cp.to_user', $ids)
                  ->orderByRaw("FIELD(cp.to_user, {$idsString})");
        } else {
            $nameTerm = null;

            // Multi-mode filters take priority over single-field search
            if (!empty($filters)) {
                foreach ($filters as $filterField => $value) {
                    $value = trim((string) $value);
                    if ($value === '') continue;
                    $this->applyFilter($query, $filterField, $value);
                }
                if (!empty($filters['name'])) {
                    $nameTerm = trim($filters['name']);
                }
            } elseif ($search !== '' && !empty($fields)) {
                $query->where(function ($q) use ($fields, $search) {
                    foreach ($fields as $f) {
                        $this->applyOrFilter($q, $f, $search);
                    }
                });
                if (in_array('name', (array) $fields)) {
                    $nameTerm = $search;
                }
            } elseif ($search !== '' && $field !== '') {
                $this->applyFilter($query, $field, $search);
                if ($field === 'name') $nameTerm = $search;
            }

            if ($nameTerm !== null) {
                // Rank exact-prefix matches above mid-string matches for better UX
                $query->orderByRaw(
                    "CASE WHEN cp.first_name LIKE ? THEN 1 WHEN cp.first_name LIKE ? THEN 2
                          WHEN cp.last_name LIKE ? THEN 3 WHEN cp.last_name LIKE ? THEN 4
                          ELSE 5 END ASC",
                    ["{$nameTerm}%", "%{$nameTerm}%", "{$nameTerm}%", "%{$nameTerm}%"]
                );
            }

            $query->orderBy('cp.to_user', 'desc');
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * @param int $id
     * @return array|null
     */
    public function findById(int $id): ?array
    {
        $row = DB::table('customer_profile as cp')
            ->leftJoin('customer_profile_extras as cpe', 'cpe.customer_id', '=', 'cp.to_user')
            ->select([
                'cp.to_user', 'cp.first_name', 'cp.last_name', 'cp.email',
                'cp.alternative_email', 'cp.tel', 'cp.alternative_tel',
                'cp.pers_nr', 'cp.adress', 'cp.post_nr', 'cp.ort',
                'cp.region_code', 'cp.sex', 'cp.birthdate', 'cp.careof',
                'cp.sync', 'cp.credit_check', 'cp.do_not_call',
                'cp.difficult_customer', 'cp.blocked_fees', 'cp.reminders', 'cp.date_added',
                'cpe.block_email', 'cpe.block_gdpr', 'cpe.block_dm',
                'cpe.payment_preference', 'cpe.delivery_method',
                'cpe.household_adults', 'cpe.household_children',
                DB::raw('0 as ltv'),
                DB::raw('(SELECT COUNT(*) FROM orders o WHERE o.by_user = cp.to_user) as order_count'),
                DB::raw('(SELECT MAX(o.date_added) FROM orders o WHERE o.by_user = cp.to_user) as last_order_date'),
            ])
            ->where('cp.to_user', $id)
            ->first();

        return $row ? (array) $row : null;
    }

    /**
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        $profile = $this->model->where('to_user', $id)->first();
        if (!$profile) return false;

        $batchId = (CustomerChange::max('change_batch_id') ?? 0) + 1;

        $profileFields = [
            'first_name', 'last_name', 'email', 'alternative_email',
            'tel', 'alternative_tel', 'pers_nr', 'adress', 'post_nr',
            'ort', 'region_code', 'sex', 'birthdate', 'careof',
            'sync', 'credit_check', 'do_not_call', 'difficult_customer', 'reminders', 'blocked_fees',
        ];
        $profileData = array_intersect_key($data, array_flip($profileFields));
        if (!empty($profileData)) {
            $profile->update($profileData);
            $profile->logChanges('update', $batchId, $id);
        }

        $extrasFields = ['block_email', 'block_gdpr', 'block_dm', 'payment_preference', 'delivery_method', 'household_adults', 'household_children'];
        $extrasData   = array_intersect_key($data, array_flip($extrasFields));
        if (!empty($extrasData)) {
            $existing     = CustomerProfileExtra::where('customer_id', $id)->first();
            $originalData = $existing ? $existing->toArray() : [];

            CustomerProfileExtra::updateOrCreate(['customer_id' => $id], $extrasData);

            foreach ($extrasData as $field => $newValue) {
                $oldValue = $originalData[$field] ?? null;
                $oldNorm  = $this->normalizeForCompare($oldValue);
                $newNorm  = $this->normalizeForCompare($newValue);

                // Skip unchanged fields — avoids noise in the audit trail
                if ($oldNorm === $newNorm) continue;

                CustomerChange::create([
                    'change_initiator_user_id' => null,
                    'change_date'              => now(),
                    'change_batch_id'          => $batchId,
                    'change_user_id'           => $id,
                    'change_action'            => 'update',
                    'change_field'             => $field,
                    'change_old_value'         => $oldValue !== null ? (string) $oldNorm : null,
                    'change_new_value'         => $newValue !== null ? (string) $newNorm : null,
                ]);
            }
        }

        return true;
    }

    /**
     * @param int $customerId
     * @param int $perPage
     * @param int $page
     * @param string|null $dateFrom
     * @param string|null $dateTo
     * @return LengthAwarePaginator
     */
    public function getOrders(int $customerId, int $perPage, int $page, ?string $dateFrom = null, ?string $dateTo = null): LengthAwarePaginator
    {
        $query = DB::table('orders')
            ->select([
                'id', 'date_added', 'date_shipped', 'date_paid', 'total',
                'payment_method', 'is_processed', 'is_shipped', 'is_paid',
                'ref', 'ref1', 'prod_id', 'subscription_id', 'origin',
                DB::raw("(SELECT key_2 FROM `log` WHERE type='return_order' AND key_1='success' AND key_3=orders.id ORDER BY id DESC LIMIT 1) as return_type"),
            ])
            ->where('by_user', $customerId);

        if ($dateFrom) {
            $query->where('date_added', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('date_added', '<=', $dateTo . ' 23:59:59');
        }

        return $query->orderBy('date_added', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * @param int $customerId
     * @param string $state
     * @param int $perPage
     * @param int $page
     * @param string|null $dateFrom
     * @param string|null $dateTo
     * @return LengthAwarePaginator
     */
    public function getOrdersByState(int $customerId, string $state, int $perPage, int $page, ?string $dateFrom = null, ?string $dateTo = null): LengthAwarePaginator
    {
        $table = match ($state) {
            'deleted'  => 'orders_deleted',
            'rejected' => 'orders_temp',
            default    => 'orders',
        };

        // Guard against optional tables that may not exist in all environments
        if (!Schema::hasTable($table)) {
            return new LengthAwarePaginator([], 0, $perPage, $page);
        }

        $select = ['id', 'date_added', 'date_shipped', 'total', 'payment_method', 'ref', 'ref1', 'prod_id', 'subscription_id', 'origin'];

        if ($state === 'approved') {
            $select = array_merge($select, ['date_paid', 'is_processed', 'is_shipped', 'is_paid']);
        }

        if ($state === 'deleted') {
            $select = array_merge($select, ['date_deleted', 'date_paid', 'cancel_reason', 'cancel_category', 'cancel_reception']);
        }

        $query = DB::table($table)
            ->select(array_merge($select, [
                DB::raw("(SELECT key_2 FROM `log` WHERE type='return_order' AND key_1='success' AND key_3={$table}.id ORDER BY id DESC LIMIT 1) as return_type"),
            ]))
            ->where('by_user', $customerId);

        if ($dateFrom) {
            $query->where('date_added', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('date_added', '<=', $dateTo . ' 23:59:59');
        }

        return $query->orderBy('date_added', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * @param int $customerId
     * @param string $state
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function getSubscriptions(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator
    {
        $table = $state === 'deleted' ? 'subscriptions_deleted' : 'subscriptions';

        // Guard against optional tables that may not exist in all environments
        if (!Schema::hasTable($table)) {
            return new LengthAwarePaginator([], 0, $perPage, $page);
        }

        // Column name differs between the active and deleted subscriptions tables
        $userCol = Schema::hasColumn($table, 'user_id') ? 'user_id' : 'by_user';

        return DB::table($table)
            ->select(['id', $userCol, 'active', 'cancel_method', 'cancel_category', 'cancel_reason',
                      'payment_type', 'remote_id', 'subscription_id',
                      'next_shipment', 'date_started', 'date_cancelled', 'ref', 'ref1'])
            ->where($userCol, $customerId)
            ->orderBy('date_started', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * @param mixed $value
     * @return mixed
     */
    private function normalizeForCompare(mixed $value): mixed
    {
        if ($value === null) return null;
        if (is_bool($value)) return (int) $value;
        if ($value === '1' || $value === 1) return 1;
        if ($value === '0' || $value === 0) return 0;
        return $value;
    }

    /**
     * @param mixed $query
     * @param string $field
     * @param string $value
     * @return void
     */
    private function applyFilter($query, string $field, string $value): void
    {
        match ($field) {
            'name'              => $query->where(function ($q) use ($value) {
                $q->where('cp.first_name', 'LIKE', "%{$value}%")
                  ->orWhere('cp.last_name', 'LIKE', "%{$value}%")
                  ->orWhereRaw("CONCAT(cp.first_name, ' ', cp.last_name) LIKE ?", ["%{$value}%"]);
            }),
            'email'             => $query->where('cp.email', 'LIKE', "%{$value}%"),
            'alternative_email' => $query->where('cp.alternative_email', 'LIKE', "%{$value}%"),
            'adress'            => $query->where('cp.adress', 'LIKE', "%{$value}%"),
            'tel'               => $query->where('cp.tel', 'LIKE', "%{$value}%"),
            'pers_nr'           => $query->where('cp.pers_nr', 'LIKE', "%{$value}%"),
            'customer_no'       => $query->where('cp.to_user', 'LIKE', "%{$value}%"),
            'order_no'          => $query->whereExists(function ($sub) use ($value) {
                $sub->from('orders')->whereColumn('by_user', 'cp.to_user')
                    ->where(function ($q) use ($value) {
                        $q->where('id', $value)->orWhere('ref', 'LIKE', "%{$value}%");
                    });
            }),
            // sinfrid_id is not available in the customer_profile table
            'sinfrid_id' => $query->whereRaw('0 = 1'),
            default      => null,
        };
    }

    /**
     * @param mixed $query
     * @param string $field
     * @param string $value
     * @return void
     */
    private function applyOrFilter($query, string $field, string $value): void
    {
        match ($field) {
            'name'              => $query->orWhere(function ($q) use ($value) {
                $q->where('cp.first_name', 'LIKE', "%{$value}%")
                  ->orWhere('cp.last_name', 'LIKE', "%{$value}%")
                  ->orWhereRaw("CONCAT(cp.first_name, ' ', cp.last_name) LIKE ?", ["%{$value}%"]);
            }),
            'email'             => $query->orWhere('cp.email', 'LIKE', "%{$value}%"),
            'alternative_email' => $query->orWhere('cp.alternative_email', 'LIKE', "%{$value}%"),
            'adress'            => $query->orWhere('cp.adress', 'LIKE', "%{$value}%"),
            'tel'               => $query->orWhere('cp.tel', 'LIKE', "%{$value}%"),
            'pers_nr'           => $query->orWhere('cp.pers_nr', 'LIKE', "%{$value}%"),
            'customer_no'       => $query->orWhere('cp.to_user', 'LIKE', "%{$value}%"),
            'order_no'          => $query->orWhereExists(function ($sub) use ($value) {
                $sub->from('orders')->whereColumn('by_user', 'cp.to_user')
                    ->where(function ($q) use ($value) {
                        $q->where('id', $value)->orWhere('ref', 'LIKE', "%{$value}%");
                    });
            }),
            default => null,
        };
    }
}

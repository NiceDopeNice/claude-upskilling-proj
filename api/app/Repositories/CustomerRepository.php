<?php

/**
 * Upskilling Project
 */

namespace App\Repositories;

use App\Contracts\Repositories\CustomerRepositoryInterface;
use App\Models\CustomerProfile;
use App\Models\CustomerProfileExtra;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CustomerRepository implements CustomerRepositoryInterface
{
    public function listing(array $params): LengthAwarePaginator
    {
        $perPage = (int) ($params['per_page'] ?? 50);
        $page    = (int) ($params['page'] ?? 1);
        $ids     = array_values(array_filter(array_map('intval', $params['ids'] ?? [])));
        $filters = $params['filters'] ?? [];
        $search  = trim($params['search'] ?? '');
        $field   = $params['field'] ?? '';
        $fields  = array_filter($params['fields'] ?? []);

        $query = DB::table('customer_profile as cp')
            ->leftJoin('customer_profile_extras as cpe', 'cpe.customer_id', '=', 'cp.to_user')
            ->select([
                'cp.to_user',
                'cp.first_name',
                'cp.last_name',
                'cp.email',
                'cp.tel',
                'cp.pers_nr',
                'cp.adress',
                'cp.ort',
                DB::raw('NULL as sinfrid_id'),
                DB::raw('(SELECT MAX(o.date_added) FROM orders o WHERE o.by_user = cp.to_user) as last_order_date'),
            ]);

        if (!empty($ids)) {
            $idsString = implode(',', $ids);
            $query->whereIn('cp.to_user', $ids)
                  ->orderByRaw("FIELD(cp.to_user, {$idsString})");
        } else {
            $nameTerm = null;

            // Multi-mode filters take priority
            if (!empty($filters)) {
                foreach ($filters as $filterField => $value) {
                    $value = trim((string) $value);
                    if ($value === '') {
                        continue;
                    }
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
                if ($field === 'name') {
                    $nameTerm = $search;
                }
            }

            if ($nameTerm !== null) {
                $query->orderByRaw(
                    "CASE
                        WHEN cp.first_name LIKE ? THEN 1
                        WHEN cp.first_name LIKE ? THEN 2
                        WHEN cp.last_name  LIKE ? THEN 3
                        WHEN cp.last_name  LIKE ? THEN 4
                        ELSE 5
                    END ASC",
                    ["{$nameTerm}%", "%{$nameTerm}%", "{$nameTerm}%", "%{$nameTerm}%"]
                );
            }

            $query->orderBy('cp.to_user', 'desc');
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function findById(int $id): ?array
    {
        $row = DB::table('customer_profile as cp')
            ->leftJoin('customer_profile_extras as cpe', 'cpe.customer_id', '=', 'cp.to_user')
            ->select([
                'cp.to_user',
                'cp.first_name',
                'cp.last_name',
                'cp.email',
                'cp.alternative_email',
                'cp.tel',
                'cp.alternative_tel',
                'cp.pers_nr',
                'cp.adress',
                'cp.post_nr',
                'cp.ort',
                'cp.region_code',
                'cp.do_not_call',
                'cp.difficult_customer',
                'cp.blocked_fees',
                'cp.date_added',
                'cpe.block_email',
                'cpe.block_gdpr',
                'cpe.block_dm',
                DB::raw('0 as ltv'),
                DB::raw('(SELECT COUNT(*) FROM orders o WHERE o.by_user = cp.to_user) as order_count'),
                DB::raw('(SELECT MAX(o.date_added) FROM orders o WHERE o.by_user = cp.to_user) as last_order_date'),
            ])
            ->where('cp.to_user', $id)
            ->first();

        return $row ? (array) $row : null;
    }

    public function update(int $id, array $data): bool
    {
        $profile = CustomerProfile::where('to_user', $id)->first();
        if (!$profile) return false;

        $profileFields = [
            'first_name', 'last_name', 'email', 'alternative_email',
            'tel', 'alternative_tel', 'pers_nr', 'adress', 'post_nr',
            'ort', 'region_code', 'do_not_call', 'difficult_customer',
        ];
        $profileData = array_intersect_key($data, array_flip($profileFields));
        if (!empty($profileData)) {
            $profile->update($profileData);
        }

        $extrasData = array_intersect_key($data, array_flip(['block_email', 'block_gdpr', 'block_dm']));
        if (!empty($extrasData)) {
            CustomerProfileExtra::updateOrCreate(['customer_id' => $id], $extrasData);
        }

        return true;
    }

    public function getOrders(int $customerId, int $perPage, int $page): LengthAwarePaginator
    {
        return DB::table('orders')
            ->select([
                'id',
                'date_added',
                'date_shipped',
                'date_paid',
                'total',
                'payment_method',
                'is_processed',
                'is_shipped',
                'is_paid',
                'ref',
                'prod_id',
                'subscription_id',
            ])
            ->where('by_user', $customerId)
            ->orderBy('date_added', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    private function applyFilter($query, string $field, string $value): void
    {
        match ($field) {
            'name'             => $query->where(function ($q) use ($value) {
                $q->where('cp.first_name', 'LIKE', "%{$value}%")
                  ->orWhere('cp.last_name', 'LIKE', "%{$value}%")
                  ->orWhereRaw("CONCAT(cp.first_name, ' ', cp.last_name) LIKE ?", ["%{$value}%"]);
            }),
            'email'            => $query->where('cp.email', 'LIKE', "%{$value}%"),
            'alternative_email'=> $query->where('cp.alternative_email', 'LIKE', "%{$value}%"),
            'adress'           => $query->where('cp.adress', 'LIKE', "%{$value}%"),
            'tel'              => $query->where('cp.tel', 'LIKE', "%{$value}%"),
            'pers_nr'          => $query->where('cp.pers_nr', 'LIKE', "%{$value}%"),
            'customer_no'      => $query->where('cp.to_user', 'LIKE', "%{$value}%"),
            'order_no'         => $query->whereExists(function ($sub) use ($value) {
                $sub->from('orders')
                    ->whereColumn('by_user', 'cp.to_user')
                    ->where(function ($q) use ($value) {
                        $q->where('id', $value)
                          ->orWhere('ref', 'LIKE', "%{$value}%");
                    });
            }),
            'sinfrid_id'       => $query->whereRaw('0 = 1'),
            default            => null,
        };
    }

    private function applyOrFilter($query, string $field, string $value): void
    {
        match ($field) {
            'name'             => $query->orWhere(function ($q) use ($value) {
                $q->where('cp.first_name', 'LIKE', "%{$value}%")
                  ->orWhere('cp.last_name', 'LIKE', "%{$value}%")
                  ->orWhereRaw("CONCAT(cp.first_name, ' ', cp.last_name) LIKE ?", ["%{$value}%"]);
            }),
            'email'            => $query->orWhere('cp.email', 'LIKE', "%{$value}%"),
            'alternative_email'=> $query->orWhere('cp.alternative_email', 'LIKE', "%{$value}%"),
            'adress'           => $query->orWhere('cp.adress', 'LIKE', "%{$value}%"),
            'tel'              => $query->orWhere('cp.tel', 'LIKE', "%{$value}%"),
            'pers_nr'          => $query->orWhere('cp.pers_nr', 'LIKE', "%{$value}%"),
            'customer_no'      => $query->orWhere('cp.to_user', 'LIKE', "%{$value}%"),
            'order_no'         => $query->orWhereExists(function ($sub) use ($value) {
                $sub->from('orders')
                    ->whereColumn('by_user', 'cp.to_user')
                    ->where(function ($q) use ($value) {
                        $q->where('id', $value)
                          ->orWhere('ref', 'LIKE', "%{$value}%");
                    });
            }),
            'sinfrid_id'       => null,
            default            => null,
        };
    }
}

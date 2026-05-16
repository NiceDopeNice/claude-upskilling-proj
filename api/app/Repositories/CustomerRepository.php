<?php

/**
 * Upskilling Project
 */

namespace App\Repositories;

use App\Contracts\Repositories\CustomerRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CustomerRepository implements CustomerRepositoryInterface
{
    public function listing(array $params): LengthAwarePaginator
    {
        $perPage = (int) ($params['per_page'] ?? 50);
        $page    = (int) ($params['page'] ?? 1);
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
                'cpe.trial_sinfrid',
                DB::raw('(SELECT MAX(o.date_added) FROM orders o WHERE o.by_user = cp.to_user) as last_order_date'),
            ]);

        // Multi-mode filters take priority
        if (!empty($filters)) {
            foreach ($filters as $filterField => $value) {
                $value = trim((string) $value);
                if ($value === '') {
                    continue;
                }
                $this->applyFilter($query, $filterField, $value);
            }
        } elseif ($search !== '' && !empty($fields)) {
            $query->where(function ($q) use ($fields, $search) {
                foreach ($fields as $f) {
                    $this->applyOrFilter($q, $f, $search);
                }
            });
        } elseif ($search !== '' && $field !== '') {
            $this->applyFilter($query, $field, $search);
        }

        return $query
            ->orderBy('cp.to_user', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
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
                DB::raw('COALESCE((SELECT SUM(css.LTV) FROM cache_subscription_stats css WHERE css.user_id = cp.to_user), 0) as ltv'),
                DB::raw('(SELECT COUNT(*) FROM orders o WHERE o.by_user = cp.to_user) as order_count'),
                DB::raw('(SELECT MAX(o.date_added) FROM orders o WHERE o.by_user = cp.to_user) as last_order_date'),
            ])
            ->where('cp.to_user', $id)
            ->first();

        return $row ? (array) $row : null;
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
            default            => null,
        };
    }
}

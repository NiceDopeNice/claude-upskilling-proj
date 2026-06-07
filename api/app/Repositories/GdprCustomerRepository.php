<?php

namespace App\Repositories;

use App\Contracts\Repositories\GdprCustomerRepositoryInterface;
use App\Models\GdprCustomer;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class GdprCustomerRepository implements GdprCustomerRepositoryInterface
{
    public function listing(array $params): LengthAwarePaginator
    {
        $perPage = (int) ($params['per_page'] ?? 50);
        $page    = (int) ($params['page'] ?? 1);
        $status  = $params['status'] ?? null;
        $type    = $params['exclusion_type'] ?? null;
        $search  = trim($params['search'] ?? '');

        $query = DB::table('gdpr_customers as gc')
            ->join('customer_profile as cp', 'cp.to_user', '=', 'gc.customer_id')
            ->select([
                'gc.id',
                'gc.customer_id',
                'gc.status',
                'gc.exclusion_type',
                'gc.flagged_at',
                'gc.anonymized_at',
                'gc.restored_at',
                'gc.requested_by',
                'gc.created_at',
                'gc.updated_at',
                'cp.first_name',
                'cp.last_name',
                'cp.email',
            ]);

        if ($status) {
            $query->where('gc.status', $status);
        }

        if ($type) {
            $query->where('gc.exclusion_type', $type);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('cp.first_name', 'LIKE', "%{$search}%")
                  ->orWhere('cp.last_name', 'LIKE', "%{$search}%")
                  ->orWhereRaw("CONCAT(cp.first_name, ' ', cp.last_name) LIKE ?", ["%{$search}%"])
                  ->orWhere('cp.email', 'LIKE', "%{$search}%")
                  ->orWhere('gc.customer_id', 'LIKE', "%{$search}%");
            });
        }

        return $query
            ->orderBy('gc.flagged_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function findByCustomerId(int $customerId): ?GdprCustomer
    {
        return GdprCustomer::where('customer_id', $customerId)->first();
    }

    public function create(array $data): GdprCustomer
    {
        return GdprCustomer::create($data);
    }

    public function update(GdprCustomer $record, array $data): bool
    {
        return $record->update($data);
    }

    public function delete(GdprCustomer $record): bool
    {
        return (bool) $record->delete();
    }
}

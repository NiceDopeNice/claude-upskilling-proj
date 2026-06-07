<?php

namespace App\Contracts\Services;

use Illuminate\Pagination\LengthAwarePaginator;

interface GdprCustomerServiceInterface
{
    public function list(array $params): LengthAwarePaginator;
    public function flag(int $customerId, string $exclusionType): array;
    public function unflag(int $customerId): bool;
    public function anonymize(int $customerId): array;
    public function restore(int $customerId): array;
    public function reject(int $customerId): array;
    public function bulkAction(string $action, array $customerIds): array;
    public function exclusionTypes(): array;
}

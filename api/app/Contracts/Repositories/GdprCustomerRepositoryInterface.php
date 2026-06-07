<?php

namespace App\Contracts\Repositories;

use App\Models\GdprCustomer;
use Illuminate\Pagination\LengthAwarePaginator;

interface GdprCustomerRepositoryInterface
{
    public function listing(array $params): LengthAwarePaginator;
    public function findByCustomerId(int $customerId): ?GdprCustomer;
    public function create(array $data): GdprCustomer;
    public function update(GdprCustomer $record, array $data): bool;
    public function delete(GdprCustomer $record): bool;
}

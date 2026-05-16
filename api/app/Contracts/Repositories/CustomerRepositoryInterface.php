<?php

/**
 * Upskilling Project
 */

namespace App\Contracts\Repositories;

use Illuminate\Pagination\LengthAwarePaginator;

interface CustomerRepositoryInterface
{
    public function listing(array $params): LengthAwarePaginator;

    public function findById(int $id): ?array;

    public function getOrders(int $customerId, int $perPage, int $page): LengthAwarePaginator;
}

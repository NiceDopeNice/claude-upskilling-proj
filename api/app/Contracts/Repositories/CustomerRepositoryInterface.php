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

    public function update(int $id, array $data): bool;

    public function getOrders(int $customerId, int $perPage, int $page): LengthAwarePaginator;

    public function getOrdersByState(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator;

    public function getSubscriptions(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator;
}

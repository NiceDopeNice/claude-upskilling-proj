<?php

/**
 * Upskilling Project
 */

namespace App\Contracts\Services;

use Illuminate\Pagination\LengthAwarePaginator;

interface CustomerServiceInterface
{
    public function list(array $params): LengthAwarePaginator;

    public function detail(int $id): ?array;

    public function update(int $id, array $data): bool;

    public function orders(int $customerId, int $perPage, int $page): LengthAwarePaginator;
}

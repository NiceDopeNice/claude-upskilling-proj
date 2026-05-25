<?php

/**
 * Upskilling Project
 */

namespace App\Services;

use App\Contracts\Repositories\CustomerRepositoryInterface;
use App\Contracts\Services\CustomerServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerService implements CustomerServiceInterface
{
    public function __construct(
        private CustomerRepositoryInterface $repository
    ) {}

    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->listing($params);
    }

    public function detail(int $id): ?array
    {
        return $this->repository->findById($id);
    }

    public function update(int $id, array $data): bool
    {
        return $this->repository->update($id, $data);
    }

    public function orders(int $customerId, int $perPage, int $page): LengthAwarePaginator
    {
        return $this->repository->getOrders($customerId, $perPage, $page);
    }
}

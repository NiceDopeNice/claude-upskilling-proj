<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/CustomerService.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Services;

use App\Modules\Customer\Repository\Contracts\CustomerRepositoryInterface;
use App\Modules\Customer\Services\Contracts\CustomerServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerService implements CustomerServiceInterface
{
    public function __construct(
        private readonly CustomerRepositoryInterface $repository
    ) {}

    /**
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->listing($params);
    }

    /**
     * @param int $id
     * @return array|null
     */
    public function detail(int $id): ?array
    {
        return $this->repository->findById($id);
    }

    /**
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        return $this->repository->update($id, $data);
    }

    /**
     * @param int $customerId
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function orders(int $customerId, int $perPage, int $page): LengthAwarePaginator
    {
        return $this->repository->getOrders($customerId, $perPage, $page);
    }

    /**
     * @param int $customerId
     * @param string $state
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function ordersByState(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator
    {
        return $this->repository->getOrdersByState($customerId, $state, $perPage, $page);
    }

    /**
     * @param int $customerId
     * @param string $state
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function subscriptions(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator
    {
        return $this->repository->getSubscriptions($customerId, $state, $perPage, $page);
    }
}

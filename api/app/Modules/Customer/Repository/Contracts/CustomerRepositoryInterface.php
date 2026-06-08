<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/Contracts/CustomerRepositoryInterface.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Repository\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface CustomerRepositoryInterface
{
    /**
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function listing(array $params): LengthAwarePaginator;

    /**
     * @param int $id
     * @return array|null
     */
    public function findById(int $id): ?array;

    /**
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update(int $id, array $data): bool;

    /**
     * @param int $customerId
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function getOrders(int $customerId, int $perPage, int $page): LengthAwarePaginator;

    /**
     * @param int $customerId
     * @param string $state
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function getOrdersByState(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator;

    /**
     * @param int $customerId
     * @param string $state
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function getSubscriptions(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator;
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/Contracts/CustomerServiceInterface.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Services\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface CustomerServiceInterface
{
    /**
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function list(array $params): LengthAwarePaginator;

    /**
     * @param int $id
     * @return array|null
     */
    public function detail(int $id): ?array;

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
    public function orders(int $customerId, int $perPage, int $page): LengthAwarePaginator;

    /**
     * @param int $customerId
     * @param string $state
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function ordersByState(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator;

    /**
     * @param int $customerId
     * @param string $state
     * @param int $perPage
     * @param int $page
     * @return LengthAwarePaginator
     */
    public function subscriptions(int $customerId, string $state, int $perPage, int $page): LengthAwarePaginator;
}

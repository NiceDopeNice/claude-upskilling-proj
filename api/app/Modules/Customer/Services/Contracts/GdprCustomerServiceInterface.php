<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/Contracts/GdprCustomerServiceInterface.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Services\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface GdprCustomerServiceInterface
{
    /**
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function list(array $params): LengthAwarePaginator;

    /**
     * @param int $customerId
     * @param string $exclusionType
     * @return array
     */
    public function flag(int $customerId, string $exclusionType): array;

    /**
     * @param int $customerId
     * @return bool
     */
    public function unflag(int $customerId): bool;

    /**
     * @param int $customerId
     * @return array
     */
    public function anonymize(int $customerId): array;

    /**
     * @param int $customerId
     * @return array
     */
    public function restore(int $customerId): array;

    /**
     * @param int $customerId
     * @return array
     */
    public function reject(int $customerId): array;

    /**
     * @param string $action
     * @param array $customerIds
     * @return array
     */
    public function bulkAction(string $action, array $customerIds): array;

    /**
     * @return array
     */
    public function exclusionTypes(): array;
}

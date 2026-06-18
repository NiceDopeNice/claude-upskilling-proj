<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/Contracts/OrderRepositoryInterface.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Repository\Contracts;

use Illuminate\Support\Collection;

interface OrderRepositoryInterface
{
    /**
     * @param int $orderId
     * @return array|null
     */
    public function findById(int $orderId): ?array;

    /**
     * @param int $orderId
     * @param int $customerId
     * @return array|null
     */
    public function findByIdAndCustomer(int $orderId, int $customerId): ?array;

    /**
     * @param int $orderId
     * @param string $cancelReason
     * @param string|null $cancelCategory
     * @param string|null $cancelReception
     * @return bool
     */
    public function cancel(int $orderId, string $cancelReason, ?string $cancelCategory, ?string $cancelReception): bool;

    /**
     * @param int $orderId
     * @return Collection
     */
    public function getAdjustments(int $orderId): Collection;

    /**
     * @param array $data
     * @return array
     */
    public function createAdjustment(array $data): array;
}

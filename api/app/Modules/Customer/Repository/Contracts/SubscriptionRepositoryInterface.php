<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/Contracts/SubscriptionRepositoryInterface.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Repository\Contracts;

interface SubscriptionRepositoryInterface
{
    /**
     * @param int $subId
     * @return array|null
     */
    public function findById(int $subId): ?array;

    /**
     * @param int $subId
     * @param string $nextShipment
     * @return bool
     */
    public function updateNextShipment(int $subId, string $nextShipment): bool;

    /**
     * @param int $subId
     * @param string $cancelReason
     * @param string|null $cancelMethod
     * @param string|null $cancelCategory
     * @return bool
     */
    public function deactivate(int $subId, string $cancelReason, ?string $cancelMethod, ?string $cancelCategory): bool;

    /**
     * Count pre-financed orders tied to a subscription.
     *
     * @param int $subId
     * @return int
     */
    public function countPreFinancedOrders(int $subId): int;
}

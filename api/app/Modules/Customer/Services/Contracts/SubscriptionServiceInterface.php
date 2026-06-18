<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/Contracts/SubscriptionServiceInterface.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Services\Contracts;

interface SubscriptionServiceInterface
{
    /**
     * @param int $subId
     * @return array|null
     */
    public function detail(int $subId): ?array;

    /**
     * @param int $subId
     * @param string $nextShipment
     * @return array{success: bool, message: string}
     */
    public function updateNextShipment(int $subId, string $nextShipment): array;

    /**
     * @param int $subId
     * @param string $cancelReason
     * @param string|null $cancelMethod
     * @param string|null $cancelCategory
     * @return array{success: bool, message: string}
     */
    public function deactivate(int $subId, string $cancelReason, ?string $cancelMethod, ?string $cancelCategory): array;
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/Contracts/OrderServiceInterface.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Services\Contracts;

interface OrderServiceInterface
{
    /**
     * @param int $orderId
     * @return array|null
     */
    public function detail(int $orderId): ?array;

    /**
     * @param int $orderId
     * @param string $cancelReason
     * @param string|null $cancelCategory
     * @param string|null $cancelReception
     * @return array{success: bool, message: string}
     */
    public function cancel(int $orderId, string $cancelReason, ?string $cancelCategory, ?string $cancelReception): array;

    /**
     * @param int $orderId
     * @param string $type
     * @param float $amount
     * @param string|null $reason
     * @return array{success: bool, message: string, adjustment: array|null}
     */
    public function adjust(int $orderId, string $type, float $amount, ?string $reason): array;
}

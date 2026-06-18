<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/SubscriptionService.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Services;

use App\Modules\Customer\Repository\Contracts\SubscriptionRepositoryInterface;
use App\Modules\Customer\Services\Contracts\SubscriptionServiceInterface;

class SubscriptionService implements SubscriptionServiceInterface
{
    public function __construct(
        private readonly SubscriptionRepositoryInterface $repository
    ) {}

    /**
     * @param int $subId
     * @return array|null
     */
    public function detail(int $subId): ?array
    {
        $sub = $this->repository->findById($subId);
        if (!$sub) {
            return null;
        }

        $sub['pre_finance_count'] = $this->repository->countPreFinancedOrders($subId);

        return $sub;
    }

    /**
     * @param int $subId
     * @param string $nextShipment
     * @return array{success: bool, message: string}
     */
    public function updateNextShipment(int $subId, string $nextShipment): array
    {
        $updated = $this->repository->updateNextShipment($subId, $nextShipment);

        if (!$updated) {
            return ['success' => false, 'message' => 'Subscription not found or inactive.'];
        }

        return ['success' => true, 'message' => 'Next shipment date updated.'];
    }

    /**
     * @param int $subId
     * @param string $cancelReason
     * @param string|null $cancelMethod
     * @param string|null $cancelCategory
     * @return array{success: bool, message: string}
     */
    public function deactivate(int $subId, string $cancelReason, ?string $cancelMethod, ?string $cancelCategory): array
    {
        $deactivated = $this->repository->deactivate($subId, $cancelReason, $cancelMethod, $cancelCategory);

        if (!$deactivated) {
            return ['success' => false, 'message' => 'Subscription not found or already inactive.'];
        }

        return ['success' => true, 'message' => 'Subscription deactivated.'];
    }
}

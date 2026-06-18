<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/OrderService.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Services;

use App\Modules\Customer\Repository\Contracts\OrderRepositoryInterface;
use App\Modules\Customer\Services\Contracts\OrderServiceInterface;
use Exception;

class OrderService implements OrderServiceInterface
{
    public function __construct(
        private readonly OrderRepositoryInterface $repository
    ) {}

    /**
     * @param int $orderId
     * @return array|null
     */
    public function detail(int $orderId): ?array
    {
        $order = $this->repository->findById($orderId);
        if (!$order) {
            return null;
        }

        $order['adjustments'] = $this->repository->getAdjustments($orderId)
            ->map(function ($row) {
                $a = (array) $row;
                $a['amount'] = (float) ($a['amount'] ?? 0);
                return $a;
            })
            ->values()
            ->all();

        return $order;
    }

    /**
     * @param int $orderId
     * @param string $cancelReason
     * @param string|null $cancelCategory
     * @param string|null $cancelReception
     * @return array{success: bool, message: string}
     */
    public function cancel(int $orderId, string $cancelReason, ?string $cancelCategory, ?string $cancelReception): array
    {
        try {
            $cancelled = $this->repository->cancel($orderId, $cancelReason, $cancelCategory, $cancelReception);

            if (!$cancelled) {
                return ['success' => false, 'message' => 'Order not found.'];
            }

            return ['success' => true, 'message' => 'Order cancelled successfully.'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * @param int $orderId
     * @param string $type
     * @param float $amount
     * @param string|null $reason
     * @return array{success: bool, message: string, adjustment: array|null}
     */
    public function adjust(int $orderId, string $type, float $amount, ?string $reason): array
    {
        $order = $this->repository->findById($orderId);
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found.', 'adjustment' => null];
        }

        try {
            $adjustment = $this->repository->createAdjustment([
                'order_id' => $orderId,
                'type'     => $type,
                'amount'   => $amount,
                'reason'   => $reason,
            ]);

            return ['success' => true, 'message' => 'Adjustment applied.', 'adjustment' => $adjustment];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage(), 'adjustment' => null];
        }
    }
}

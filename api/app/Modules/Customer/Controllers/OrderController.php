<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/OrderController.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdjustOrderRequest;
use App\Http\Requests\CancelOrderRequest;
use App\Modules\Customer\Resources\OrderDetailResource;
use App\Modules\Customer\Services\Contracts\OrderServiceInterface;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderServiceInterface $service
    ) {}

    /**
     * @param int $orderId
     * @return JsonResponse
     */
    public function show(int $orderId): JsonResponse
    {
        $order = $this->service->detail($orderId);

        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(['data' => (new OrderDetailResource($order))->toArray(request())]);
    }

    /**
     * @param CancelOrderRequest $request
     * @param int $orderId
     * @return JsonResponse
     */
    public function cancel(CancelOrderRequest $request, int $orderId): JsonResponse
    {
        $result = $this->service->cancel(
            $orderId,
            $request->string('cancel_reason'),
            $request->string('cancel_category') ?: null,
            $request->string('cancel_reception') ?: null,
        );

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json(['message' => $result['message']]);
    }

    /**
     * @param AdjustOrderRequest $request
     * @param int $orderId
     * @return JsonResponse
     */
    public function adjust(AdjustOrderRequest $request, int $orderId): JsonResponse
    {
        $result = $this->service->adjust(
            $orderId,
            $request->string('type'),
            (float) $request->input('amount'),
            $request->string('reason') ?: null,
        );

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message'    => $result['message'],
            'adjustment' => $result['adjustment'],
        ], 201);
    }
}

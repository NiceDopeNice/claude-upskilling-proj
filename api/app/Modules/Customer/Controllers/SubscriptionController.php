<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/SubscriptionController.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeactivateSubscriptionRequest;
use App\Http\Requests\UpdateNextShipmentRequest;
use App\Modules\Customer\Resources\SubscriptionDetailResource;
use App\Modules\Customer\Services\Contracts\SubscriptionServiceInterface;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionServiceInterface $service
    ) {}

    /**
     * @param int $subId
     * @return JsonResponse
     */
    public function show(int $subId): JsonResponse
    {
        $sub = $this->service->detail($subId);

        if (!$sub) {
            return response()->json(['message' => 'Subscription not found.'], 404);
        }

        return response()->json(['data' => (new SubscriptionDetailResource($sub))->toArray(request())]);
    }

    /**
     * @param UpdateNextShipmentRequest $request
     * @param int $subId
     * @return JsonResponse
     */
    public function updateNextShipment(UpdateNextShipmentRequest $request, int $subId): JsonResponse
    {
        $result = $this->service->updateNextShipment($subId, $request->string('next_shipment'));

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json(['message' => $result['message']]);
    }

    /**
     * @param DeactivateSubscriptionRequest $request
     * @param int $subId
     * @return JsonResponse
     */
    public function deactivate(DeactivateSubscriptionRequest $request, int $subId): JsonResponse
    {
        $result = $this->service->deactivate(
            $subId,
            $request->string('cancel_reason'),
            $request->string('cancel_method') ?: null,
            $request->string('cancel_category') ?: null,
        );

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json(['message' => $result['message']]);
    }
}

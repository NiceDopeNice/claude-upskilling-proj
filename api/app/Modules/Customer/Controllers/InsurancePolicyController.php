<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/InsurancePolicyController.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelInsurancePolicyRequest;
use App\Http\Requests\CreateInsurancePolicyRequest;
use App\Modules\Customer\Resources\InsurancePolicyResource;
use App\Modules\Customer\Services\Contracts\InsurancePolicyServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InsurancePolicyController extends Controller
{
    public function __construct(
        private readonly InsurancePolicyServiceInterface $service
    ) {}

    /**
     * @param int $customerId
     * @return AnonymousResourceCollection
     */
    public function index(int $customerId): AnonymousResourceCollection
    {
        return InsurancePolicyResource::collection(
            $this->service->listByCustomer($customerId)
        );
    }

    /**
     * @param CreateInsurancePolicyRequest $request
     * @param int $customerId
     * @return JsonResponse
     */
    public function store(CreateInsurancePolicyRequest $request, int $customerId): JsonResponse
    {
        $result = $this->service->create($customerId, $request->validated());

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message' => $result['message'],
            'data'    => new InsurancePolicyResource($result['policy']),
        ], 201);
    }

    /**
     * @param CancelInsurancePolicyRequest $request
     * @param int $customerId
     * @param string $policyId
     * @return JsonResponse
     */
    public function cancel(CancelInsurancePolicyRequest $request, int $customerId, string $policyId): JsonResponse
    {
        $result = $this->service->cancel($customerId, $policyId, $request->string('reason'));

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message' => $result['message'],
            'data'    => new InsurancePolicyResource($result['policy']),
        ]);
    }
}

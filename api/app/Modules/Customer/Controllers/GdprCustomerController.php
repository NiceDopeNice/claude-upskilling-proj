<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/GdprCustomerController.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkGdprActionRequest;
use App\Http\Requests\FlagGdprCustomerRequest;
use App\Http\Requests\ListGdprCustomerRequest;
use App\Modules\Customer\Resources\GdprCustomerResource;
use App\Modules\Customer\Services\Contracts\GdprCustomerServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GdprCustomerController extends Controller
{
    public function __construct(
        private readonly GdprCustomerServiceInterface $service
    ) {}

    /**
     * @param ListGdprCustomerRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(ListGdprCustomerRequest $request): AnonymousResourceCollection
    {
        return GdprCustomerResource::collection($this->service->list($request->validated()));
    }

    /**
     * @return JsonResponse
     */
    public function exclusionTypes(): JsonResponse
    {
        return response()->json(['data' => $this->service->exclusionTypes()]);
    }

    /**
     * @param FlagGdprCustomerRequest $request
     * @return JsonResponse
     */
    public function flag(FlagGdprCustomerRequest $request): JsonResponse
    {
        $result = $this->service->flag($request->integer('customer_id'), $request->string('exclusion_type'));

        if (!$result['success']) return response()->json(['message' => $result['message']], 422);

        return response()->json(['message' => 'Customer flagged for GDPR.', 'data' => $this->buildResource($result['data'])], 201);
    }

    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function unflag(int $customerId): JsonResponse
    {
        if (!$this->service->unflag($customerId)) {
            return response()->json(['message' => 'No GDPR record found for this customer.'], 404);
        }
        return response()->json(['message' => 'Customer removed from GDPR.']);
    }

    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function anonymize(int $customerId): JsonResponse
    {
        $result = $this->service->anonymize($customerId);
        if (!$result['success']) return response()->json(['message' => $result['message']], 422);
        return response()->json(['message' => 'Customer data anonymized.', 'data' => $this->buildResource($result['data'])]);
    }

    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function restore(int $customerId): JsonResponse
    {
        $result = $this->service->restore($customerId);
        if (!$result['success']) return response()->json(['message' => $result['message']], 422);
        return response()->json(['message' => 'Customer data restored.', 'data' => $this->buildResource($result['data'])]);
    }

    /**
     * @param int $customerId
     * @return JsonResponse
     */
    public function reject(int $customerId): JsonResponse
    {
        $result = $this->service->reject($customerId);
        if (!$result['success']) return response()->json(['message' => $result['message']], 422);
        return response()->json(['message' => 'GDPR request rejected.', 'data' => $this->buildResource($result['data'])]);
    }

    /**
     * @param BulkGdprActionRequest $request
     * @return JsonResponse
     */
    public function bulkAction(BulkGdprActionRequest $request): JsonResponse
    {
        $result = $this->service->bulkAction($request->string('action'), $request->input('customer_ids'));

        return response()->json([
            'message' => "Bulk action completed: {$result['success']} succeeded, {$result['failed']} failed.",
            'result'  => $result,
        ]);
    }

    /**
     * @param mixed $data
     * @return array
     */
    private function buildResource(mixed $data): array
    {
        return (new GdprCustomerResource($data))->toArray(request());
    }
}


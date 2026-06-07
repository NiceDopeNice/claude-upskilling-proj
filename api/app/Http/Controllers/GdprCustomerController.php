<?php

namespace App\Http\Controllers;

use App\Contracts\Services\GdprCustomerServiceInterface;
use App\Http\Requests\BulkGdprActionRequest;
use App\Http\Requests\FlagGdprCustomerRequest;
use App\Http\Requests\ListGdprCustomerRequest;
use App\Http\Resources\GdprCustomerResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GdprCustomerController extends Controller
{
    public function __construct(
        private GdprCustomerServiceInterface $service
    ) {}

    public function index(ListGdprCustomerRequest $request): AnonymousResourceCollection
    {
        $records = $this->service->list($request->validated());

        return GdprCustomerResource::collection($records);
    }

    public function exclusionTypes(): JsonResponse
    {
        return response()->json(['data' => $this->service->exclusionTypes()]);
    }

    public function flag(FlagGdprCustomerRequest $request): JsonResponse
    {
        $result = $this->service->flag(
            $request->integer('customer_id'),
            $request->string('exclusion_type')
        );

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message' => 'Customer flagged for GDPR.',
            'data'    => $this->buildResource($result['data']),
        ], 201);
    }

    public function unflag(int $customerId): JsonResponse
    {
        $success = $this->service->unflag($customerId);

        if (!$success) {
            return response()->json(['message' => 'No GDPR record found for this customer.'], 404);
        }

        return response()->json(['message' => 'Customer removed from GDPR.']);
    }

    public function anonymize(int $customerId): JsonResponse
    {
        $result = $this->service->anonymize($customerId);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message' => 'Customer data anonymized.',
            'data'    => $this->buildResource($result['data']),
        ]);
    }

    public function restore(int $customerId): JsonResponse
    {
        $result = $this->service->restore($customerId);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message' => 'Customer data restored.',
            'data'    => $this->buildResource($result['data']),
        ]);
    }

    public function reject(int $customerId): JsonResponse
    {
        $result = $this->service->reject($customerId);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        return response()->json([
            'message' => 'GDPR request rejected.',
            'data'    => $this->buildResource($result['data']),
        ]);
    }

    public function bulkAction(BulkGdprActionRequest $request): JsonResponse
    {
        $result = $this->service->bulkAction(
            $request->string('action'),
            $request->input('customer_ids')
        );

        return response()->json([
            'message' => "Bulk action completed: {$result['success']} succeeded, {$result['failed']} failed.",
            'result'  => $result,
        ]);
    }

    private function buildResource(mixed $data): array
    {
        return (new GdprCustomerResource($data))->toArray(request());
    }
}

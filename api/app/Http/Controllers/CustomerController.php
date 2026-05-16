<?php

/**
 * Upskilling Project
 */

namespace App\Http\Controllers;

use App\Contracts\Services\CustomerServiceInterface;
use App\Http\Requests\ListCustomerRequest;
use App\Http\Resources\CustomerDetailResource;
use App\Http\Resources\CustomerOrderResource;
use App\Http\Resources\CustomerResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function __construct(
        private CustomerServiceInterface $service
    ) {}

    public function index(ListCustomerRequest $request): AnonymousResourceCollection
    {
        $customers = $this->service->list($request->validated());

        return CustomerResource::collection($customers);
    }

    public function show(int $id): JsonResponse
    {
        $customer = $this->service->detail($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        return response()->json([
            'data' => (new CustomerDetailResource((object) $customer))->toArray(request()),
        ]);
    }

    public function orders(Request $request, int $id): JsonResponse|AnonymousResourceCollection
    {
        $customer = $this->service->detail($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $perPage = (int) ($request->query('per_page', 20));
        $page    = (int) ($request->query('page', 1));

        $orders = $this->service->orders($id, $perPage, $page);

        return CustomerOrderResource::collection($orders);
    }
}

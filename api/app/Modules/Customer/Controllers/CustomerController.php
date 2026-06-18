<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Controllers/CustomerController.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Modules\Customer\Resources\CustomerDetailResource;
use App\Modules\Customer\Resources\CustomerOrderDeletedResource;
use App\Modules\Customer\Resources\CustomerOrderResource;
use App\Modules\Customer\Resources\CustomerResource;
use App\Modules\Customer\Resources\CustomerSubscriptionResource;
use App\Modules\Customer\Services\Contracts\CustomerServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerServiceInterface $service
    ) {}

    /**
     * @param ListCustomerRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(ListCustomerRequest $request): AnonymousResourceCollection
    {
        return CustomerResource::collection($this->service->list($request->validated()));
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
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

    /**
     * @param UpdateCustomerRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateCustomerRequest $request, int $id): JsonResponse
    {
        $customer = $this->service->detail($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $this->service->update($id, $request->validated());

        $updated = $this->service->detail($id);

        return response()->json([
            'message' => 'Customer has been updated successfully',
            'data'    => (new CustomerDetailResource((object) $updated))->toArray(request()),
        ]);
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse|AnonymousResourceCollection
     */
    public function orders(Request $request, int $id): JsonResponse|AnonymousResourceCollection
    {
        $customer = $this->service->detail($id);
        if (!$customer) return response()->json(['message' => 'Customer not found'], 404);

        $perPage   = (int) ($request->query('per_page', 20));
        $page      = (int) ($request->query('page', 1));
        $dateFrom  = $request->query('date_from');
        $dateTo    = $request->query('date_to');

        return CustomerOrderResource::collection($this->service->orders($id, $perPage, $page, $dateFrom, $dateTo));
    }

    /**
     * @param Request $request
     * @param int $id
     * @param string $state
     * @return JsonResponse|AnonymousResourceCollection
     */
    public function ordersByState(Request $request, int $id, string $state): JsonResponse|AnonymousResourceCollection
    {
        if (!in_array($state, ['approved', 'rejected', 'deleted'])) {
            return response()->json(['message' => 'Invalid state'], 422);
        }

        $customer = $this->service->detail($id);
        if (!$customer) return response()->json(['message' => 'Customer not found'], 404);

        $perPage  = (int) ($request->query('per_page', 20));
        $page     = (int) ($request->query('page', 1));
        $dateFrom = $request->query('date_from');
        $dateTo   = $request->query('date_to');

        $orders = $this->service->ordersByState($id, $state, $perPage, $page, $dateFrom, $dateTo);

        // Deleted orders have additional cancellation fields — use a dedicated resource
        return $state === 'deleted'
            ? CustomerOrderDeletedResource::collection($orders)
            : CustomerOrderResource::collection($orders);
    }

    /**
     * @param Request $request
     * @param int $id
     * @param string $state
     * @return JsonResponse|AnonymousResourceCollection
     */
    public function subscriptions(Request $request, int $id, string $state): JsonResponse|AnonymousResourceCollection
    {
        if (!in_array($state, ['approved', 'deleted'])) {
            return response()->json(['message' => 'Invalid state'], 422);
        }

        $customer = $this->service->detail($id);
        if (!$customer) return response()->json(['message' => 'Customer not found'], 404);

        $perPage = (int) ($request->query('per_page', 20));
        $page    = (int) ($request->query('page', 1));

        return CustomerSubscriptionResource::collection($this->service->subscriptions($id, $state, $perPage, $page));
    }
}


# Controller Rules

---

## Purpose

Controllers are **request delegation only**. Parse the request, delegate to a service, return a JSON response. No business logic lives here.

---

## Rules

- Always return `JsonResponse`
- Delegate to the service immediately — no logic in the controller
- Use `FormRequest` for validation — never validate in the controller body
- Never access a Repository directly from a controller
- Use API Resources to shape responses — never return raw models or arrays

---

## Structure

```php
public function actionName(StoreCustomerRequest $request): JsonResponse
{
    // 1. Extract validated input (FormRequest already validated)
    $data = $request->validated();

    // 2. Delegate to service
    $result = $this->customerService->create($data);

    // 3. Return resource response
    return new CustomerResource($result);
}
```

---

## Examples

### Index (list)

```php
/**
 * @return JsonResponse
 */
public function index(): JsonResponse
{
    $customers = $this->customerService->getActive();
    return CustomerResource::collection($customers)->response();
}
```

### Show (single)

```php
/**
 * @param int $id
 * @return JsonResponse
 */
public function show(int $id): JsonResponse
{
    $customer = $this->customerService->findById($id);
    return new CustomerResource($customer);
}
```

### Store (create)

```php
/**
 * @param StoreCustomerRequest $request
 * @return JsonResponse
 */
public function store(StoreCustomerRequest $request): JsonResponse
{
    $customer = $this->customerService->create($request->validated());
    return (new CustomerResource($customer))->response()->setStatusCode(201);
}
```

---

## HTTP Status Codes

| Scenario | Code |
|---|---|
| Successful fetch | 200 |
| Created | 201 |
| No content (delete) | 204 |
| Validation error | 422 (handled by FormRequest automatically) |
| Not found | 404 |
| Server error | 500 |

---

## Anti-Patterns

Never:
- Write if/else business logic in a controller
- Loop over data in a controller
- Access a repository from a controller
- Build Eloquent queries in a controller
- Return `$model->toArray()` — always use a Resource

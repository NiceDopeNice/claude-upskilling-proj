# API Conventions

## Single Source of Truth

- All HTTP calls live in `src/api/{feature}Api.ts`.
- Components and pages never import `axios` / `fetch` directly.
- Each API module exports one typed function per endpoint.

## Function Shape

```ts
// src/api/customerApi.ts

export async function fetchCustomers(
  params: ListCustomerRequest
): Promise<PaginatedResponse<CustomerResource>> {
  const { data } = await api.get('/customers', { params });
  return data;
}

export async function updateCustomer(
  id: number,
  payload: UpdateCustomerRequest
): Promise<CustomerDetailResource> {
  const { data } = await api.put(`/customers/${id}`, payload);
  return data.data;
}
```

## Mirroring Laravel Resources

- Every API function's return type must match the corresponding Laravel API Resource exactly.
- If the Laravel resource changes, update the TypeScript interface and the API function together.

## Error Handling

- Do not swallow errors in the API layer — let them propagate to the hook.
- Handle errors in the hook (show toasts, set error state).
- Type error responses — do not use `any` for caught errors.

```ts
import axios, { AxiosError } from 'axios';

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// In hook:
catch (err) {
  const error = err as AxiosError<ApiError>;
  const message = error.response?.data?.message ?? 'Something went wrong';
  toast.error(message);
}
```

## Request DTOs

- Define a TypeScript type for every request body — never pass plain objects.
- Optional fields should be typed as `field?: Type` not `field: Type | undefined`.

## Hooks as the API Consumer

- Hooks call API functions and manage loading/error/data state.
- Components only call hook actions — never API functions directly.

```ts
// src/hooks/useCustomerList.ts
export function useCustomerList(params: ListCustomerRequest) {
  const [customers, setCustomers] = useState<CustomerResource[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCustomers(params)
      .then(res => setCustomers(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params]);

  return { customers, loading, error };
}
```

## Pagination

- Always use `PaginatedResponse<T>` as the return type for list endpoints.
- Pass `page` and `per_page` as query params — never hardcode pagination limits.

## Deduplication

- Avoid duplicate API calls — cache or share hook instances where possible.
- If two components need the same data, lift the hook to their common parent.

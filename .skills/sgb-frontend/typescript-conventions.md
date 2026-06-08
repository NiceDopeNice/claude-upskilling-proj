# TypeScript Conventions

## Strictness

- Use strict TypeScript — `"strict": true` in tsconfig.
- Never use `any`. Use `unknown` and narrow, or define a proper type.
- Never use type assertions (`as X`) unless unavoidable — document why.
- Enable `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`.

## Typing Rules

- Type **every** function parameter and return value.
- Type all API responses — mirror every Laravel API Resource with a TypeScript interface.
- Use `readonly` properties whenever data should not be mutated after creation.
- Use generics where a function or type works across multiple shapes.
- Prefer `interface` for object shapes that may be extended; `type` for unions and aliases.

## Naming

- Interfaces: `PascalCase` — `CustomerResource`, `PaginatedResponse<T>`
- Types: `PascalCase` — `GdprStatus`, `OrderState`
- Enums: `PascalCase` with `PascalCase` members — mirrors Laravel backend enums.
- Hooks: `camelCase` prefixed with `use` — `useCustomerList`, `useGdprActions`
- API functions: `camelCase` verb-noun — `fetchCustomers`, `flagGdprCustomer`

## API Contract Typing

Every Laravel API Resource must have a matching TypeScript interface:

```ts
// Mirrors App\Modules\Customer\Resources\CustomerResource
export interface CustomerResource {
  readonly id: number;
  readonly customer_no: number;
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly tel: string | null;
  readonly pers_nr: string | null;
  readonly adress: string | null;
  readonly ort: string | null;
  readonly last_order_date: string | null;
  readonly sinfrid_id: number | null;
}
```

## Generic Pagination

```ts
export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}
```

## DTOs

- Define a request DTO type for every POST/PUT payload.
- Keep request and response types separate — do not reuse one for both.

```ts
export interface UpdateCustomerRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  tel?: string | null;
}
```

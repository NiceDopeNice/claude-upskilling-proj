# Repository Rules

---

## Purpose

Repositories are the **only** place that touches the database via Eloquent. They abstract all data access so services never write queries.

---

## Rules

- No business logic inside repositories
- No classification, filtering by business rules, or formatting
- Eager-load relations the caller will access — prevents N+1
- Always use return type hints
- Return `Collection`, `LengthAwarePaginator`, `Model`, or scalar — never raw query builder

---

## Examples

```php
// Returns paginated active customers — caller controls page size
public function getActive(int $perPage = 15): LengthAwarePaginator
{
    return CustomerProfile::where('is_active', 1)->paginate($perPage);
}

// Eager-loads orders to prevent N+1 when caller iterates
public function findById(int $id): ?CustomerProfile
{
    return CustomerProfile::with('orders')->find($id);
}

// Returns ID list only — no hydration overhead
public function getActiveIds(): array
{
    return CustomerProfile::where('is_active', 1)->pluck('id')->toArray();
}
```

---

## Query Style

Use explicit JOINs over `whereHas` for performance:

```php
// Prefer this
$query->join('orders', 'orders.customer_id', '=', 'customer_profiles.id')
      ->where('orders.status', 'active');

// Not this
$query->whereHas('orders', fn($q) => $q->where('status', 'active'));
```

---

## Method Naming

| Intent | Naming pattern |
|---|---|
| Fetch single | `findById`, `findByEmail` |
| Fetch collection | `getAll`, `getActive`, `getByStatus` |
| Fetch IDs only | `getActiveIds`, `getExpiredIds` |
| Count | `countActive`, `countByBrand` |
| Create | `create` |
| Update | `update`, `upsert` |
| Delete | `delete`, `softDelete` |

---

## Anti-Patterns

Never:
- Make business decisions inside a repository
- Call a service from a repository
- Return a query builder — always resolve with `->get()`, `->first()`, `->pluck()`, `->paginate()`, etc.
- Write raw SQL strings unless absolutely necessary and documented

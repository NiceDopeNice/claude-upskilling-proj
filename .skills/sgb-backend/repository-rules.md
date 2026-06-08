# Repository Rules

---

## Purpose

Repositories are the **only** place that touches the database. They abstract all data access so services never write queries.

---

## Rules

- No business logic inside repositories
- No classification, filtering by business rules, or formatting
- Eager-load relations that the caller will access — prevents N+1
- Return type hints always present
- Return `Collection`, `array`, or a specific model — never raw query builder

---

## Examples

```php
// Returns only IDs — no business logic, no classification
public function getActiveOrderIds(array $ids): array
{
    return Order::whereIn('id', $ids)->pluck('id')->toArray();
}

// Eager-load relations used downstream to prevent N+1
public function getDeletedOrders(array $ids): Collection
{
    return OrderDeleted::whereIn('id', $ids)->with('returnLogs')->get();
}
```

---

## Query Style

Use explicit JOINs over `whereHas` for performance — `whereHas` generates correlated subqueries:

```php
// Prefer this
$query->join('subscriptions', 'subscriptions.order_id', '=', 'orders.id')
      ->where('subscriptions.status', 'active');

// Not this
$query->whereHas('subscription', fn($q) => $q->where('status', 'active'));
```

---

## Method Naming

| Intent | Naming pattern |
|---|---|
| Fetch single record | `findById`, `findByEmail` |
| Fetch collection | `getAll`, `getByStatus`, `getExpired` |
| Fetch IDs only | `getActiveIds`, `getExpiredIds` |
| Create/update | `create`, `update`, `upsert` |
| Delete | `delete`, `softDelete` |

> **Exception — `SendGridRepository`:** All methods use the `fetch` prefix (e.g. `fetchAggregatedEmailEvents`, `fetchCustomerEmailLog`). Follow this pattern when adding new methods to that repository.

---

## Anti-Patterns

Never:
- Make business decisions inside a repository
- Call a service from a repository
- Return a query builder — always resolve with `->get()`, `->first()`, `->pluck()`, etc.
- Write raw SQL strings unless absolutely necessary and documented

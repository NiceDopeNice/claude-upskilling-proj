# Customer Feature — Implementation Notes

## File Structure (as built)

### Laravel API
```
app/
├── Http/
│   ├── Controllers/CustomerController.php     — index, show, orders actions
│   ├── Requests/ListCustomerRequest.php       — validates search/fields[]/filters/page/per_page
│   └── Resources/
│       ├── CustomerResource.php               — listing row (to_user as id+customer_no)
│       ├── CustomerDetailResource.php         — full detail incl. flags, ltv, order_count
│       └── CustomerOrderResource.php          — derives status from is_shipped/is_paid/is_processed
├── Services/CustomerService.php
├── Repositories/CustomerRepository.php        — all SQL; listing(), findById(), getOrders()
├── Contracts/
│   ├── Services/CustomerServiceInterface.php
│   └── Repositories/CustomerRepositoryInterface.php
└── Providers/AppServiceProvider.php           — binds interfaces to implementations
```

### React Frontend
```
src/
├── api/customerApi.ts          — getCustomers(), getCustomer(), getCustomerOrders()
├── hooks/useCustomers.ts       — all list state: mode, simple, chips, page, perPage
└── pages/Customers/
    ├── index.tsx               — page root, wires hook → components
    └── components/
        ├── CustomerTable.tsx   — TanStack Table, pagination controls, max-h-[600px] scroll
        ├── CustomerSearch.tsx  — simple multi-select + multi chip mode
        ├── CustomerSheet.tsx   — slide-over details (Sheet)
        └── CustomerOrdersSheet.tsx  — order history modal (Dialog)
```

---

## Key Implementation Decisions

### `fields[]` OR search (simple mode)
The original design had a single-field selector. Changed to multi-select checkboxes so a single term can match across e.g. Name + Email simultaneously. Backend uses a `where(function($q){})` wrapper with `orWhere` calls per field.

### `applyOrFilter` vs `applyFilter`
Two separate private methods on `CustomerRepository`:
- `applyFilter` — uses `where()`, called for multi-mode chips (AND across chips)
- `applyOrFilter` — uses `orWhere()`, called inside a closure for `fields[]` (OR across columns)

### `DropdownMenuCheckboxItem` stays open
Base UI's `Menu.CheckboxItem` defaults `closeOnClick: false`, so the column selector stays open while the user checks/unchecks multiple columns — no extra prop needed.

### No `asChild` with Base UI triggers
Base UI uses a `render` prop, not Radix's `asChild`. Wrapping a `<Button>` inside `<DropdownMenuTrigger asChild>` creates a button-inside-button DOM violation. All triggers are styled directly (className on the trigger element itself).

### Order history: dual pagination
API loads 10 orders per page (`PER_PAGE = 10`). Client-side search then filters that set. If filtered results exceed 10, local pagination kicks in. API page navigation loads the next batch. This keeps API calls minimal while still allowing search within a loaded page.

### Client-side order search
`useMemo` over the fetched `orders` array — searches id, date_added, date_shipped, total, payment_method, prod_id, subscription_id, status as lowercased strings. No extra API calls.

### Closing animation error
`useEffect` was originally `[customer, open]` — when the sheet closed, it ran with `open=false`, cleared `detail`, and the error state briefly rendered during the close animation. Fixed by using `[customer?.id, open]` and early-returning when `!open || !customer`. Detail is intentionally kept in state during close so the animation is smooth.

### `customer_profile_extras` table name
The real table name has a trailing `s` (`customer_profile_extras`). The model's `$table` property and the repository JOIN both use the correct name.

### `LTV` column casing
The `cache_subscription_stats` table uses uppercase `LTV`. The repository `SUM` query uses `css.LTV` to match.

### `id` vs `to_user`
The `customer_profile` table has no `id` column — the primary key is `to_user`. Both `CustomerResource.id` and `CustomerResource.customer_no` map to `to_user`. The frontend `Customer.id` is actually `to_user`.

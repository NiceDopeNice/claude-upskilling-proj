# Customer Feature — Technical Specifications

## API

### `GET /api/customers`

**Request validation (`ListCustomerRequest`):**

| Param | Rules |
|---|---|
| `search` | nullable, string, max:255 |
| `field` | nullable, string, in: name,customer_no,email,tel,pers_nr,adress,alternative_email |
| `fields[]` | nullable, array |
| `fields.*` | nullable, string, in: name,customer_no,email,tel,pers_nr,adress,alternative_email |
| `filters` | nullable, array |
| `filters.*` | nullable, string, max:255 |
| `per_page` | nullable, integer, in: 50,100,200,500 |
| `page` | nullable, integer, min:1 |

**Search priority:** `filters` > `fields[]` > `field` (legacy single-field)

**Response shape:**
```json
{
  "data": [
    {
      "id": 12345,
      "customer_no": 12345,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "tel": "0701234567",
      "pers_nr": "19900101-1234",
      "adress": "Main Street 1",
      "ort": "Stockholm",
      "last_order_date": "2024-03-15",
      "trial_sinfrid": false
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 1234,
    "last_page": 25
  }
}
```

---

### `GET /api/customers/{id}`

`{id}` must match `[0-9]+`.

**Response shape:**
```json
{
  "data": {
    "id": 12345,
    "customer_no": 12345,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "alternative_email": null,
    "tel": "0701234567",
    "alternative_tel": null,
    "pers_nr": "19900101-1234",
    "adress": "Main Street 1",
    "post_nr": "11122",
    "ort": "Stockholm",
    "region_code": "SE",
    "date_added": "2020-01-15",
    "ltv": 1250.50,
    "order_count": 12,
    "last_order_date": "2024-03-15",
    "do_not_call": false,
    "difficult_customer": false,
    "blocked_fees": false,
    "block_email": false,
    "block_gdpr": false,
    "block_dm": false
  }
}
```

---

### `GET /api/customers/{id}/orders`

| Param | Default |
|---|---|
| `page` | 1 |
| `per_page` | 20 |

**Response shape:**
```json
{
  "data": [
    {
      "id": 987,
      "date_added": "2024-03-15",
      "date_shipped": "2024-03-17",
      "date_paid": "2024-03-15",
      "total": 349.00,
      "payment_method": "card",
      "status": "shipped",
      "ref": "REF-001",
      "prod_id": 42,
      "subscription_id": 7
    }
  ],
  "meta": { "current_page": 1, "per_page": 20, "total": 12, "last_page": 1 }
}
```

**`status` derivation (in `CustomerOrderResource`):**
- `shipped` → `is_shipped = 1`
- `paid` → `is_paid = 1`
- `processed` → `is_processed = 1`
- `pending` → none of the above

---

## Database

### Tables used

| Table | Alias | Join |
|---|---|---|
| `customer_profile` | `cp` | primary |
| `customer_profile_extras` | `cpe` | LEFT JOIN on `cpe.customer_id = cp.to_user` |
| `orders` | `o` | subquery for `last_order_date`, `order_count` |
| `cache_subscription_stats` | `css` | subquery for `ltv` (`SUM(css.LTV)`) |

### `customer_profile` key columns
- Primary key: `to_user` (no `id` column)
- `first_name`, `last_name`, `email`, `alternative_email`, `tel`, `alternative_tel`
- `pers_nr`, `adress`, `post_nr`, `ort`, `region_code`
- `do_not_call`, `difficult_customer`, `blocked_fees`, `date_added`

### `customer_profile_extras` key columns
- FK: `customer_id` → `cp.to_user`
- `trial_sinfrid`, `block_email`, `block_gdpr`, `block_dm`

### `cache_subscription_stats` key columns
- FK: `user_id` → `cp.to_user`
- `LTV` (uppercase)

---

## Frontend TypeScript Interfaces

```ts
interface Customer {
  id: number           // = to_user
  customer_no: number  // = to_user
  first_name: string
  last_name: string
  email: string
  tel: string
  pers_nr: string
  adress: string
  ort: string
  last_order_date: string | null
  trial_sinfrid: boolean
}

interface CustomerDetail {
  id: number
  customer_no: number
  first_name: string
  last_name: string
  email: string
  alternative_email: string | null
  tel: string
  alternative_tel: string | null
  pers_nr: string
  adress: string
  post_nr: string | null
  ort: string
  region_code: string | null
  date_added: string | null
  ltv: number
  order_count: number
  last_order_date: string | null
  do_not_call: boolean
  difficult_customer: boolean
  blocked_fees: boolean
  block_email: boolean
  block_gdpr: boolean
  block_dm: boolean
}

interface CustomerOrder {
  id: number
  date_added: string | null
  date_shipped: string | null
  date_paid: string | null
  total: number
  payment_method: string | null
  status: 'pending' | 'processed' | 'paid' | 'shipped'
  ref: string | null
  prod_id: number | null
  subscription_id: number | null
}

interface ListCustomerParams {
  search?: string
  field?: string
  fields?: string[]
  filters?: Record<string, string>
  per_page?: number
  page?: number
}
```

---

## State — `useCustomers` hook

```ts
type SearchMode = 'simple' | 'multi'

interface SimpleSearch {
  fields: string[]   // selected column keys, OR logic
  term: string
}

interface ChipFilter {
  key: string
  label: string
  value: string
}
```

**localStorage keys:**
- `customerSearchMode` — `'simple'` | `'multi'`
- `customerFilterSearch` — `ChipFilter[]` JSON

**Debounce:** 300ms on any search state change.

**Page reset:** triggered on every search state change (term, fields, chips, per_page).

---

## Component Props Summary

### `CustomerSearch`
```ts
{
  mode: 'simple' | 'multi'
  onSwitchMode: (m: 'simple' | 'multi') => void
  simple: { fields: string[]; term: string }
  onUpdateSimple: (p: Partial<{ fields: string[]; term: string }>) => void
  onClearSimple: () => void
  chips: ChipFilter[]
  onUpdateChip: (key: string, value: string) => void
  onRemoveChip: (key: string) => void
  onAddChip: (chip: Omit<ChipFilter, 'value'>) => void
  onReorderChips: (chips: ChipFilter[]) => void
  availableToAdd: Omit<ChipFilter, 'value'>[]
}
```

### `CustomerTable`
```ts
{
  data: Customer[]
  meta: { current_page: number; per_page: number; total: number; last_page: number } | null
  loading: boolean
  selectedId: number | null
  onRowClick: (customer: Customer) => void
  onOrdersClick: (customer: Customer) => void
  page: number
  perPage: number
  onPageChange: (p: number) => void
  onPerPageChange: (pp: number) => void
}
```

### `CustomerSheet`
```ts
{ customer: Customer | null; open: boolean; onClose: () => void }
```

### `CustomerOrdersSheet`
```ts
{ customer: Customer | null; open: boolean; onClose: () => void }
```

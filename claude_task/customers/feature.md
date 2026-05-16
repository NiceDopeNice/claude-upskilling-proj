# Customer Listing / Search / Details — Feature Spec

## Overview

Full customer management view: server-side paginated listing, dual-mode search, slide-over details sheet, and a modal order history per customer.

**Stack:**
- Laravel 11 API (backend)
- React 19 + Vite + TypeScript (frontend)
- Base UI v1 + shadcn/ui + lucide-react (UI components)
- TanStack Table v8 (data table)
- @dnd-kit (drag-and-drop chip reordering)

---

## 1. Customer Listing

Server-side paginated table from `customer_profile` + `customer_profile_extras` (LEFT JOIN).

**Columns:**

| Column | Source | Notes |
|---|---|---|
| Customer # | `cp.to_user` | View orders button + mono number on same row |
| Name | `cp.first_name` + `cp.last_name` | Email shown below in muted text |
| SSN | `cp.pers_nr` | Mono font, muted |
| Phone | `cp.tel` | |
| Address | `cp.adress` | |
| City | `cp.ort` | |
| Sinfrid | `cpe.trial_sinfrid` | Violet pill badge when true, dash when false |
| Last Order | subquery `MAX(orders.date_added)` | Formatted `sv-SE` locale or "N/A" |

**Customer # cell anatomy:**
- `[🛍 icon button]  [customer number]` — one line, no wrap
- Icon button opens order history modal on click (stops row click propagation)
- Tooltip on icon: "View orders"

**Pagination:**
- Default: 50 per page; options: 50, 100, 200, 500
- Smart page buttons: `‹ 1 2 3 … 25 ›`
- Shows: "Showing X – Y of Z customers"
- Table has `max-h-[600px]` with vertical overflow scroll

---

## 2. Customer Search

Two modes toggled by a button. Active mode persisted in `localStorage` (`customerSearchMode`).

**Toggle button:** `SlidersHorizontal` icon → switch to multi; `Search` icon → switch to simple. Tooltip on hover.

---

### Simple Mode (default)

Single search term applied across one or more selected columns with OR logic.

**Column multi-select dropdown:**
- Button trigger showing active selection: "Name", "2 columns", or "Select columns"
- Checkbox items — menu stays open on each check/uncheck
- Available columns: Name, Customer No., Email, Phone, SSN

**Behaviour:**
- Selecting multiple columns sends `fields[]` params to API; backend applies OR across all
- Debounced 300ms
- Resets to page 1 on change
- Placeholder adapts: `Search by name, email...`
- Empty term → full list; term with no columns selected → inline warning

**Active filter badge** (below search row when active):
```
"john" in Name, Email  ×
```
Clicking `×` clears term and resets columns to `['name']`.

---

### Multi Mode (advanced)

Chip-based filters — each chip has its own label + input + remove button. All filled chips sent as `filters[key]=value` (AND logic across chips).

**Default active chips:** Customer No., SSN, Name, Phone, Email

**Additional chips (via dropdown):** Address, Alternative Email

**Chip features:**
- Drag-and-drop reorder via `@dnd-kit`
- Order and selection persisted in `localStorage` (`customerFilterSearch`)
- `+ Add filter` dropdown to restore removed chips
- Debounced 300ms per chip input

---

## 3. Customer Details Sheet

Clicking a table row opens a right-side `Sheet` (slide-over). The selected row gets a left border highlight.

**Header:**
- Avatar (initials, gradient background)
- Full name (bold, large)
- Customer # with Hash icon

**Body sections (compact `FieldGrid` table):**

*Contact:* Email, Alternative Email, Phone, Alternative Phone, SSN, Member Since

*Address:* Street, Postal/City, Region

*Flags (2-column grid):*
- Do Not Call · Difficult Customer · Blocked Fees · Block Email · Block GDPR · Block Direct Mail
- Active flags: colored chip (red/orange/amber/purple) with CheckCircle icon
- Inactive flags: muted, XCircle icon

Sheet width: `380px` (sm: `420px`). No scroll — all content fits.

---

## 4. Order History Modal

Clicking the 🛍 icon on any customer row opens a full-width `Dialog` (modal).

**Header:** Customer name + "Customer #X · Order history" + large order count (number stacked above "orders" label)

**Search bar:** client-side, searches order #, dates, total, payment, product, subscription

**Table columns:** Order #, Date Added, Date Shipped, Total (SEK), Product #, Subscription #, Shipped (Yes/No), Paid (Yes/No)

**Clickable cells:**
- Order # → copies ID to clipboard on click
- Subscription # → copies ID to clipboard on click

**Pagination — two layers:**
1. API pagination: loads 10 orders per API page; prev/next buttons shown when `last_page > 1`
2. Local pagination: within the current 10, filtered results can be paged if search narrows them

**No-orders state:** centered empty state with ShoppingBag icon.

---

## API Endpoints

### `GET /api/customers`

| Param | Type | Notes |
|---|---|---|
| `search` | string | Search term (simple mode) |
| `fields[]` | string[] | Columns to search — OR logic: `name`, `customer_no`, `email`, `tel`, `pers_nr` |
| `filters[key]` | string | Per-field values (multi mode) — AND logic |
| `per_page` | int | 50 / 100 / 200 / 500 |
| `page` | int | Default 1 |

> `filters` takes priority over `search`+`fields` when both are present.

### `GET /api/customers/{id}`

Returns full detail: contact, address, flags, date_added, ltv (from `cache_subscription_stats`), order_count, last_order_date.

### `GET /api/customers/{id}/orders`

| Param | Type |
|---|---|
| `page` | int |
| `per_page` | int |

Returns paginated orders with derived `status` field (`pending` / `processed` / `paid` / `shipped`).

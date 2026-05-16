# API Conventions

---

## Purpose

The `api/` layer is the **only** place that makes HTTP calls. Components and hooks import from here — they never use `fetch` directly.

---

## File Location

```txt
src/api/
└── customerApi.js      — one file per domain concept
```

---

## Base Setup

Create `src/api/http.js` as the shared fetch wrapper:

```js
const BASE_URL = '/api'

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  }

  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? 'Request failed')
  }

  // 204 No Content — no body to parse
  if (res.status === 204) return null

  return res.json()
}

export const http = {
  get:    (path)        => request('GET', path),
  post:   (path, body)  => request('POST', path, body),
  put:    (path, body)  => request('PUT', path, body),
  patch:  (path, body)  => request('PATCH', path, body),
  delete: (path)        => request('DELETE', path),
}
```

---

## Domain API Module

```js
// src/api/customerApi.js
import { http } from './http'

// Fetches paginated list of active customers
export const getCustomers = (page = 1) =>
  http.get(`/customers?page=${page}`)

// Fetches a single customer by ID
export const getCustomer = (id) =>
  http.get(`/customers/${id}`)

// Creates a new customer — backend validates input
export const createCustomer = (data) =>
  http.post('/customers', data)

// Updates an existing customer record
export const updateCustomer = (id, data) =>
  http.put(`/customers/${id}`, data)

// Soft-deletes a customer — returns 204
export const deleteCustomer = (id) =>
  http.delete(`/customers/${id}`)
```

---

## Rules

- One exported function per API endpoint
- Each function has a comment explaining purpose and whether it mutates data
- All functions return a Promise — callers use async/await
- No state management inside `api/` — return data only
- No error handling inside `api/` — throw so callers can handle it

---

## Anti-Patterns

Never:
- Call `fetch` directly inside a component or hook
- Handle `setState` inside an API function
- Swallow errors in the API layer — always throw
- Hard-code the full URL — use the `http` wrapper with the base path

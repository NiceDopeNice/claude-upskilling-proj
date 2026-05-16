# Testing Rules

---

## Stack

- **Vitest** — test runner (built into Vite)
- **React Testing Library** — component testing
- **MSW (Mock Service Worker)** — mock API calls in tests

---

## File Location

```txt
src/
├── api/
│   └── customerApi.test.js
├── hooks/
│   └── useCustomers.test.js
└── pages/
    └── Customers/
        └── components/
            └── CustomerList.test.jsx
```

Test files live alongside the source file they test.

---

## Test Method Naming

Pattern: `it_{does_something_when_condition}`

```js
it('renders customer names when data is loaded')
it('shows loading state while fetching')
it('shows error message when request fails')
it('calls onSelect with correct id when item is clicked')
```

---

## Component Test Structure

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomerList from './CustomerList'

const mockCustomers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

it('renders customer names when data is provided', () => {
  render(<CustomerList customers={mockCustomers} onSelect={() => {}} />)

  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Bob')).toBeInTheDocument()
})

it('calls onSelect with the correct id when item is clicked', async () => {
  const onSelect = vi.fn()
  render(<CustomerList customers={mockCustomers} onSelect={onSelect} />)

  await userEvent.click(screen.getByText('Alice'))

  expect(onSelect).toHaveBeenCalledWith(1)
})
```

---

## Hook Test Structure

```js
import { renderHook, waitFor } from '@testing-library/react'
import { useCustomers } from './useCustomers'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

it('returns customer list on successful fetch', async () => {
  server.use(
    http.get('/api/customers', () => HttpResponse.json({ data: mockCustomers }))
  )

  const { result } = renderHook(() => useCustomers())

  await waitFor(() => expect(result.current.loading).toBe(false))

  expect(result.current.customers).toHaveLength(2)
})
```

---

## Mocking Rules

- Mock API calls with MSW — not `fetch` directly
- Mock only at the network boundary — not inside components or hooks
- Always restore handlers after each test with `server.resetHandlers()`
- Use `vi.fn()` for callback prop mocks

---

## Coverage Expectations

Each component/hook should cover:
- Happy path (data renders correctly)
- Loading state
- Error state
- User interactions (click, input, submit)
- Empty state

---

## Anti-Patterns

Never:
- Test implementation details — test what the user sees and interacts with
- Mock the module under test
- Skip error and loading state tests
- Use `getByTestId` as first resort — prefer accessible queries (`getByRole`, `getByText`)

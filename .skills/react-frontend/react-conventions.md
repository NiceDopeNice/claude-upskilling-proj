# React Conventions

---

## File Structure

```txt
frontend/src/
├── pages/              — route-level page components
│   └── Customers/
│       ├── index.jsx
│       └── components/ — components used only by this page
│           └── CustomerList.jsx
├── components/         — truly shared/reusable components
│   └── Button.jsx
├── hooks/              — reusable custom hooks
│   └── useCustomers.js
├── api/                — HTTP call modules (one file per domain)
│   └── customerApi.js
├── utils/              — pure helper functions
│   └── formatDate.js
└── App.jsx
```

Page-specific components live under their page folder.
Only truly reusable components go in `src/components/`.

---

## Component Structure

Every component follows this order:

```jsx
// 1. Imports
import { useState } from 'react'

// 2. Component function
export default function CustomerList({ customers, onSelect }) {

  // 3. State declarations
  const [selected, setSelected] = useState(null)

  // 4. Derived values / early returns
  if (!customers.length) return <p>No customers found.</p>

  // 5. Event handlers
  const handleClick = (id) => {
    setSelected(id)
    onSelect(id)
  }

  // 6. Render
  return (
    <ul>
      {customers.map((c) => (
        <li key={c.id} onClick={() => handleClick(c.id)}>
          {c.name}
        </li>
      ))}
    </ul>
  )
}
```

---

## Props

- Always destructure props in the function signature
- Define `PropTypes` or use TypeScript for type safety
- Required props must be validated

---

## State Management

- Use `useState` for local UI state
- Use custom hooks (`useCustomers`, etc.) for stateful logic shared across components
- Lift state up only when two siblings need the same data
- Never fetch data directly inside a render — use `useEffect` or a custom hook

---

## Async / await

Use `async/await` with try/catch for all API calls:

```js
// Prefer this
const fetchCustomers = async () => {
  try {
    const data = await getCustomers()
    setCustomers(data)
  } catch {
    setError('Failed to load customers.')
  } finally {
    setLoading(false)
  }
}

// Not this
fetch('/api/customers')
  .then(res => res.json())
  .then(data => setCustomers(data))
```

---

## useEffect Rules

- Always define a cleanup function when subscribing or setting timers
- Always list every dependency in the dependency array — no empty array shortcuts unless truly run-once
- Extract complex effects into a named function for readability

```jsx
useEffect(() => {
  let cancelled = false

  const load = async () => {
    const data = await getCustomers()
    // Guard against stale closures after unmount
    if (!cancelled) setCustomers(data)
  }

  load()
  return () => { cancelled = true }
}, [])
```

---

## Key Rules

- Always use a stable unique `key` on list items — never use array index as key
- Keys must be unique among siblings only — not globally

---

## Anti-Patterns

Never:
- Fetch data directly inside a component body (outside `useEffect` or a hook)
- Mutate state directly — always use the setter
- Use array index as `key` in dynamic lists
- Nest component definitions inside other components (causes remount on every render)
- Put business logic inside JSX — extract to a variable or handler first

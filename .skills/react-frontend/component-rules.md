# Component Rules

---

## Purpose

Components are **UI only**. They receive data via props or a custom hook, render output, and emit events upward. No HTTP calls inside components directly.

---

## Rules

- One component per file
- Component filename matches the exported component name
- No fetch calls directly inside a component — use `api/` + `useEffect` or a custom hook
- Props flow down, events bubble up — no prop drilling beyond 2 levels (use context or a hook)
- Loading and error states must always be handled

---

## Loading + Error Pattern

```jsx
export default function CustomerList() {
  const { customers, loading, error } = useCustomers()

  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error}</p>
  if (!customers.length) return <p>No customers found.</p>

  return (
    <ul>
      {customers.map((c) => (
        <li key={c.id}>{c.name}</li>
      ))}
    </ul>
  )
}
```

---

## Button / Action Pattern

```jsx
export default function DeleteButton({ customerId, onDeleted }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteCustomer(customerId)
      onDeleted(customerId)
    } catch {
      alert('Failed to delete customer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
```

---

## Shared vs Page-Specific

| Reused across 2+ pages | → `src/components/` |
|---|---|
| Used only by one page | → `src/pages/{Page}/components/` |

Never put a page-specific component in `src/components/`.

---

## Styling

- Use CSS Modules (`ComponentName.module.css`) for component-scoped styles
- No inline styles — use CSS classes
- Global/shared styles go in `src/index.css`

---

## Anti-Patterns

Never:
- Fetch data inside a component directly without `useEffect`
- Render without handling loading and error states
- Use inline styles (`style={{ color: 'red' }}`) — use CSS classes
- Define a component inside another component function
- Spread unknown props onto DOM elements (`{...props}` on `<div>`)

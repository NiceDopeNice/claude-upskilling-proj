# Performance Rules

## Rendering

- Avoid unnecessary re-renders — memoize callbacks with `useCallback`, values with `useMemo` when the cost is justified.
- Do not over-memoize — only memoize when profiling shows a real render problem.
- Keep component trees shallow — deeply nested components are hard to reason about and slow to render.

## Data Fetching

- Avoid duplicate API calls — if two components need the same data, fetch once in a shared parent or shared hook.
- Paginate all large datasets — never fetch unbounded lists.
- Prefer eager loading (fetch related data in one request) over waterfall requests.
- Avoid fetching data inside loops.

## Lazy Loading

- Lazy load heavy page-level components with `React.lazy` / dynamic imports.
- Do not lazy load small components — the overhead outweighs the benefit.

## State

- Keep state as close to where it is used as possible.
- Avoid global state for local UI concerns (open/closed dialogs, hover states).
- Do not store derived values in state — compute them from existing state.

## Bundle

- Do not import entire libraries when only one function is needed.
  - Bad: `import _ from 'lodash'`
  - Good: `import debounce from 'lodash/debounce'`
- Tree-shake by preferring named exports.

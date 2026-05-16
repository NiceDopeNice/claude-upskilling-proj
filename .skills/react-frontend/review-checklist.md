# Review Checklist — React Frontend

Before marking any task complete, verify all of the following:

## Architecture
- [ ] No `fetch` calls directly inside a component — goes through `src/api/`
- [ ] Page-specific components live under `src/pages/{Page}/components/`
- [ ] Shared components live in `src/components/` only if used by 2+ pages
- [ ] Stateful logic extracted into a custom hook when reused across components

## Component Quality
- [ ] Loading state handled and displayed
- [ ] Error state handled and displayed
- [ ] Empty state handled and displayed
- [ ] No inline styles — CSS classes or CSS Modules used
- [ ] No array index used as `key` in dynamic lists
- [ ] No component defined inside another component function

## React Conventions
- [ ] `async/await` with try/catch used — not `.then().catch()` chains
- [ ] `useEffect` dependencies array is complete and accurate
- [ ] State never mutated directly — always uses setter
- [ ] Props destructured in function signature

## API Layer
- [ ] Each API function has a comment explaining purpose
- [ ] All HTTP calls go through `src/api/http.js` wrapper
- [ ] Errors are thrown from the API layer — not swallowed

## Tests
- [ ] Component tests cover: happy path, loading, error, empty, user interactions
- [ ] API calls mocked with MSW — not raw fetch mocks
- [ ] Test names follow `it_{does_something_when_condition}` pattern
- [ ] Accessible queries used (`getByRole`, `getByText`) over `getByTestId`

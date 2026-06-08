# Frontend Review Checklist

## TypeScript

- [ ] No `any` types anywhere
- [ ] All function parameters and return types are explicit
- [ ] Every Laravel API Resource has a matching TypeScript interface
- [ ] Request DTOs are typed separately from response types
- [ ] `readonly` used on props and response interfaces
- [ ] No unsafe type assertions without a comment explaining why

## Architecture

- [ ] Page is thin — no business logic, no direct API calls
- [ ] Component has a single responsibility
- [ ] Business logic lives in a hook, not in a component
- [ ] API calls live in `src/api/`, not in components or pages
- [ ] Hook manages loading, error, and data state

## API

- [ ] Return type matches Laravel API Resource exactly
- [ ] Errors propagate from API layer to hook (not swallowed)
- [ ] Error messages are user-facing and typed
- [ ] Paginated endpoints use `PaginatedResponse<T>`
- [ ] No duplicate API calls for the same data

## Components

- [ ] Props typed with a `Props` interface using `readonly`
- [ ] No more than 5 props (or justified with grouping)
- [ ] No API imports inside the component file
- [ ] Repeated JSX extracted into a named sub-component

## Performance

- [ ] No unbounded list fetches — pagination in place
- [ ] No waterfall fetches that could be parallelised
- [ ] Heavy page components lazy-loaded
- [ ] No whole-library imports where a single function suffices

## Code Quality

- [ ] No duplicated logic — extracted into a shared hook or utility
- [ ] Functions are small and do one thing
- [ ] Naming is descriptive — no abbreviations or ambiguous names
- [ ] No dead code or commented-out blocks
- [ ] Comments are above the line they explain, never trailing
- [ ] No blank line between a comment and its code
- [ ] Early returns used — no deeply nested if blocks
- [ ] Collection methods (`map`, `filter`, `find`) used over manual loops where intent is clearer

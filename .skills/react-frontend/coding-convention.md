# Coding Conventions

## Core Principles

- Comments explain WHY, not WHAT
- Prefer readability over cleverness
- Use guard clauses and early returns
- Keep components focused — one responsibility per component
- Separate concerns strictly across layers
- Avoid hidden side effects in components or hooks
- All generated code must follow project structure exactly

## Separation of Concerns

| Layer | Owns | Never does |
|---|---|---|
| Page component | Route-level composition | Business logic, direct fetch |
| Feature component | Feature UI + state | Direct fetch, routing |
| `api/` module | HTTP calls only | State, rendering, business logic |
| `hooks/` | Reusable stateful logic | Rendering, direct fetch |
| `utils/` | Pure helper functions | State, rendering, side effects |

## Naming

- Components: PascalCase (`CustomerList.jsx`)
- Hooks: camelCase prefixed with `use` (`useCustomers.js`)
- Utilities: camelCase (`formatDate.js`)
- API modules: camelCase (`customerApi.js`)
- CSS modules: same name as component (`CustomerList.module.css`)

## Comments

- Comments go **above** the line they describe
- Explain the **why**, not the what
- Single space after `//`

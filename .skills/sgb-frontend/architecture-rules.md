# Frontend Architecture Rules

## Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| Page | Route entry point only — thin, no business logic |
| Component | Single UI responsibility — receives props, emits events |
| Hook / Composable | Business logic, state, and API orchestration |
| API module | Raw HTTP calls — one function per endpoint |
| Type / Interface | Shape of every request and response object |

## Principles

- Follow Clean Architecture and SOLID principles.
- Separate concerns strictly:
  - **Page** = layout + routing only
  - **Component** = presentation only
  - **Hook/Composable** = business logic, side effects, derived state
  - **API module** = data fetching only
- Never put business logic inside components or pages.
- Never call API endpoints directly inside components — always go through a hook.
- Prefer composition over inheritance.
- Keep files focused on one responsibility.

## Directory Structure (React example)

```
src/
├── pages/           # Route entry points (thin)
├── components/      # Reusable UI components
│   └── {feature}/   # Feature-scoped components
├── hooks/           # Business logic hooks
│   └── use{Feature}.ts
├── api/             # HTTP layer
│   └── {feature}Api.ts
├── types/           # Shared TypeScript interfaces/types
│   └── {feature}.ts
└── utils/           # Pure utility functions
```

# Coding Conventions

## Core Principles

- Comments explain WHY, not WHAT
- Prefer readability over cleverness
- Use guard clauses and early returns
- Keep controllers thin
- Separate concerns strictly
- Avoid hidden side effects
- All generated code must follow project structure exactly

## Documentation Rules

- Every method requires PHPDoc
- Every property requires PHPDoc
- Every exported JS function requires comments
- Flowcharts must use Mermaid conventions

## Separation of Concerns

- Repository = data access only
- Service = business logic
- Controller = request delegation only
- UI = DOM only
- API layer = HTTP only

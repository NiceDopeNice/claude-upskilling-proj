# Coding Conventions

## Core Principles

- Comments explain WHY, not WHAT
- Prefer readability over cleverness
- Use guard clauses and early returns
- Keep controllers thin — delegate immediately to services
- Separate concerns strictly
- Avoid hidden side effects
- All generated code must follow project structure exactly

## Documentation Rules

- Every method requires PHPDoc
- Every property requires PHPDoc
- `@throws` required when method can throw

## Separation of Concerns

- Repository = Eloquent data access only
- Service = business logic and orchestration
- Controller = request parsing + response only
- FormRequest = validation only
- Resource = response formatting only

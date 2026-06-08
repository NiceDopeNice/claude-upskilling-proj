# Implementation & Architecture Rules

This document defines the architectural boundaries, implementation structure,
and coding conventions for all backend code.

All generated code must follow these rules exactly.

The goal is:
- predictable architecture
- strong separation of concerns
- readable implementation
- regression-resistant development
- maintainable long-term codebases

---

# Core Principles

- Think readability first
- Prefer explicit over implicit
- Comments explain WHY, not WHAT
- Avoid hidden side effects
- Separate concerns aggressively
- Prevent regressions through predictable structure
- Keep files focused on one responsibility
- Business logic belongs only in services

---

# Dependency Direction

Dependencies must only flow downward:

```txt
Controllers
    -> Services
        -> Repositories
            -> Models
```

- Controllers must never access Repositories directly
- Services must never access Controllers
- Models must never contain business logic
- Repositories must never call Services

---

# Layer Responsibilities

| Layer | Responsibility |
|---|---|
| Controller | Request delegation only — no logic |
| Service | Business logic — orchestrates repositories |
| Repository | Data access only — no business logic |
| Model | Schema definition + relations — no business logic |
| FormRequest | Input validation only |
| Resource | Response shaping only — no logic |
| Enum | Typed constants with optional label/helper methods |

---

# Project Structure (Backend)

```txt
app/
├── Contracts/
│   ├── Repositories/    ← Repository interfaces ({Concept}RepositoryInterface.php)
│   └── Services/        ← Service interfaces ({Concept}ServiceInterface.php)
├── Enums/               ← PHP 8.1 backed enums
├── Http/
│   ├── Controllers/     ← Request delegation only
│   ├── Requests/        ← Input validation (extends FormRequest)
│   └── Resources/       ← Response shaping (extends JsonResource)
├── Models/              ← Eloquent models, schema + relations
├── Providers/
│   └── AppServiceProvider.php  ← Interface → concrete bindings
├── Repositories/        ← Data access implementations
├── Services/            ← Business logic implementations
└── Traits/              ← Shared behaviour
```

- The structure is **flat**, not module-based
- All classes of the same layer share one folder
- Contracts (interfaces) live in `app/Contracts/`, not inside each layer folder
- New bindings are always registered in `AppServiceProvider::register()`

---

# Anti-Patterns

Never:
- Put business logic in a controller
- Put query logic in a service
- Access a repository from a controller directly
- Use static methods for stateful operations
- Return raw query builder objects from repositories — always resolve to arrays, paginator, or collections
- Skip registering an interface binding in `AppServiceProvider`

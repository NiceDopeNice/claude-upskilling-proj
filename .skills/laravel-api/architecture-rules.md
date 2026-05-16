# Architecture Rules

---

## Dependency Direction

```txt
Routes (api.php)
    -> FormRequest (validation)
    -> Controller (request/response only)
        -> Service (business logic)
            -> Repository (data access)
                -> Model (schema + relationships)
```

- Controllers never access Repositories directly
- Services never access Controllers
- Models never contain business logic
- Repositories never call Services

---

## Separation of Concerns

| Layer | Owns | Never does |
|---|---|---|
| Controller | Route handling, request parsing, JSON response | Business logic, DB queries |
| FormRequest | Input validation and authorization | Business logic, DB writes |
| Service | Business logic, orchestration | HTTP responses, direct DB queries |
| Repository | All Eloquent data access (read + write) | Business decisions, response formatting |
| Model | Schema, relationships, casts, scopes | Queries, business logic |
| Resource | JSON response shaping | Business logic, DB queries |

---

## Project File Structure

```txt
api/
├── app/
│   ├── Http/
│   │   ├── Controllers/        — one controller per domain concept
│   │   ├── Requests/           — FormRequest per action
│   │   └── Resources/          — API Resource per model/response
│   ├── Services/               — business logic
│   ├── Repositories/           — Eloquent data access
│   ├── Contracts/
│   │   ├── Services/           — service interfaces
│   │   └── Repositories/       — repository interfaces
│   └── Models/                 — Eloquent models
└── routes/
    └── api.php                 — route definitions only
```

---

## Service Rules

- One service per domain concept (e.g. `CustomerService`, `OrderService`)
- Services coordinate repositories — they never query directly
- All business decisions live here
- Return typed values or API Resources — not raw Eloquent collections when crossing module boundaries

---

## Dependency Injection

- All dependencies injected via constructor
- Always `private readonly` for constructor-injected services
- Never instantiate dependencies with `new` inside methods
- Program to interfaces (Contracts), not concrete classes

```php
public function __construct(
    private readonly CustomerRepositoryInterface $repository
) {}
```

---

## File Naming

- Controllers: `{Concept}Controller.php`
- Services: `{Concept}Service.php`
- Repositories: `{Concept}Repository.php`
- Contracts: same name inside `Contracts/Services/` or `Contracts/Repositories/`
- FormRequests: `{Action}{Concept}Request.php` (e.g. `StoreCustomerRequest.php`)
- Resources: `{Concept}Resource.php` or `{Concept}Collection.php`
- Models: singular PascalCase (e.g. `CustomerProfile.php`)

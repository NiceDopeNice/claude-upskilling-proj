# Architecture Rules

---

## Dependency Direction

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

## Separation of Concerns

| Layer | Owns | Never does |
|---|---|---|
| Controller | Route handling, request parsing, response | Business logic, DB queries |
| Service | Business logic, orchestration | DOM, HTTP response, direct DB |
| Repository | All data access (read + write) | Business decisions, formatting |
| Model | Schema, relationships, casts | Queries, business logic |
| FormRequest | Input validation rules | Business logic, DB queries |
| Resource | Response array shaping | Business logic, DB queries |
| Enum | Typed constants, label helpers | Stateful logic, DB queries |

---

## Service Rules

- One service per domain concept
- Services coordinate between repositories — they never query directly
- All business decisions live here
- Return typed arrays, paginators, or models — not raw Eloquent collections when crossing boundaries

---

## Dependency Injection

- All dependencies injected via constructor
- Always `private readonly` for constructor-injected services
- Never instantiate dependencies inside methods with `new` — inject them
- Program to interfaces (Contracts), not concrete classes

```php
public function __construct(
    private readonly CustomerRepositoryInterface $repository,
    private readonly AnotherServiceInterface $otherService
) {}
```

---

## Interface Bindings

Every interface must be bound to its concrete implementation in `AppServiceProvider::register()`:

```php
$this->app->bind(CustomerRepositoryInterface::class, CustomerRepository::class);
$this->app->bind(CustomerServiceInterface::class, CustomerService::class);
```

Never skip this step — unbound interfaces throw at runtime.

---

## File Naming

| Class type | File name | Location |
|---|---|---|
| Service | `{Concept}Service.php` | `app/Services/` |
| Repository | `{Concept}Repository.php` | `app/Repositories/` |
| Service interface | `{Concept}ServiceInterface.php` | `app/Contracts/Services/` |
| Repository interface | `{Concept}RepositoryInterface.php` | `app/Contracts/Repositories/` |
| Controller | `{Concept}Controller.php` | `app/Http/Controllers/` |
| Form Request | `{Action}{Concept}Request.php` | `app/Http/Requests/` |
| Resource | `{Concept}Resource.php` | `app/Http/Resources/` |
| Enum | `{Concept}.php` | `app/Enums/` |
| Model | `{Concept}.php` | `app/Models/` |
| Trait | `{Concept}.php` | `app/Traits/` |

Interface files use the `Interface` suffix — `CustomerRepositoryInterface`, not `CustomerRepository`.

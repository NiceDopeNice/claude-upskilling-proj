# Review Checklist — Laravel API

Before marking any task complete, verify all of the following:

## Architecture
- [ ] Controller delegates immediately to a service — no logic in controller body
- [ ] Service contains all business logic — not in controller or repository
- [ ] Repository is the only layer touching Eloquent
- [ ] No repository accessed directly from a controller
- [ ] FormRequest used for validation — not `$request->validate()` in controller

## PHP Conventions
- [ ] File header present with correct package name
- [ ] All methods have PHPDoc (`@param`, `@return`, `@throws`)
- [ ] All properties have PHPDoc
- [ ] Constructor uses `private readonly` promoted properties
- [ ] Interfaces used in constructor type hints (Contracts), not concrete classes

## Code Quality
- [ ] Guard clauses and early returns used where applicable
- [ ] No raw SQL unless documented with a why-comment
- [ ] Eager loading used to prevent N+1
- [ ] API Resources used to shape all responses — no raw `toArray()`
- [ ] Explicit JOINs used over `whereHas` for filtered queries

## Response
- [ ] Correct HTTP status codes returned (201 for create, 204 for delete, etc.)
- [ ] Consistent JSON structure via API Resources
- [ ] Validation errors return 422 automatically via FormRequest

## Tests
- [ ] Unit tests cover service logic with mocked repositories
- [ ] Feature tests cover API endpoints with `RefreshDatabase`
- [ ] All test methods follow `test_{method}_{scenario}_{outcome}` naming
- [ ] Happy path, empty/invalid input, and error paths covered

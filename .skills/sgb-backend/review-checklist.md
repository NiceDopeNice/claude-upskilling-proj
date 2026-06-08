# Review Checklist — Backend

Use this before marking any backend implementation complete.

---

## PHP

- [ ] File header present (`@package`, `@author`, `@datetime`)
- [ ] Every property has `@var` PHPDoc
- [ ] Every method has `@param`, `@return`, and `@throws` where applicable
- [ ] Constructor uses `private readonly` promoted properties
- [ ] No business logic in controllers
- [ ] No queries in services — repository methods used instead
- [ ] No direct repository access from controllers
- [ ] Exceptions caught and re-thrown as `RuntimeException` with context when bubbling up
- [ ] All inline comments explain WHY, placed above the line they describe
- [ ] Closures use the correct form: arrow for simple, named for complex, IIFE for scoped init

---

## Architecture

- [ ] Dependency direction flows downward only (Controller → Service → Repository → Model)
- [ ] No repository accessed directly from a controller
- [ ] No service instantiated with `new` inside a method — inject via constructor
- [ ] Cross-module references use interfaces (Contracts), not concrete classes

---

## Testing

- [ ] Happy path covered
- [ ] Empty input / no data case covered
- [ ] Exception / error path covered
- [ ] No mocking of the class under test
- [ ] Assertions are on output, not just that a method was called

---

## General

- [ ] No commented-out dead code left behind
- [ ] No `var_dump`, `print_r`, or debug output
- [ ] No hardcoded credentials or environment-specific values
- [ ] All new methods covered by at least one test

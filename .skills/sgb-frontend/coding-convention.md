# Coding Conventions

## Comments

- Write short comments **above** the line they explain — never trailing on the same line.
- No blank line between a comment and the code it describes.
- Explain **why**, not what — good names already say what.

```ts
// guard: unauthenticated users must not reach this branch
if (!user) return null;

// derive initials from first and last name for the avatar fallback
const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
```

## Control Flow

- Use early returns to eliminate nesting — the happy path should be last.
- Avoid nested `if` statements; flatten with guard clauses instead.

```ts
// Bad
function getLabel(status: string) {
  if (status) {
    if (status === 'active') {
      return 'Active';
    } else {
      return 'Inactive';
    }
  }
}

// Good
function getLabel(status: string): string {
  // unknown status falls through to default
  if (!status) return '';
  if (status === 'active') return 'Active';
  return 'Inactive';
}
```

## Loops vs. Collection Methods

- Prefer `map`, `filter`, `reduce`, `find`, `every`, `some` over `for`/`forEach` when the intent is clearer.
- Use a plain `for...of` loop only when side effects or early breaks are needed.

```ts
// Bad — manual loop with an accumulator
const names: string[] = [];
for (let i = 0; i < customers.length; i++) {
  names.push(customers[i].first_name);
}

// Good — intent is immediately clear
const names = customers.map(c => c.first_name);

// Acceptable — early break justifies for...of
for (const customer of customers) {
  if (customer.id === targetId) return customer;
}
```

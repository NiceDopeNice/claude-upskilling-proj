# Component Rules

## Responsibilities

- A component has exactly **one** responsibility: render UI based on props.
- No API calls inside components — delegate to hooks.
- No raw business logic inside components — delegate to hooks.
- No global state mutations inside components — emit events or call hook actions.

## Props

- Type all props with a `Props` interface — never use inline object types.
- Use `readonly` on every prop.
- Prefer explicit prop types over spreading unknown objects.

```tsx
interface Props {
  readonly customer: CustomerResource;
  readonly onEdit: (id: number) => void;
}
```

## State

- Keep local UI state (open/closed, hover, focus) inside the component.
- Keep remote/derived state inside hooks.
- Do not duplicate state that already exists in a hook.

## Reusability

- Build UI in small, focused pieces — prefer composing many small components over one large one.
- Extract repeated JSX patterns into named sub-components.
- Avoid passing more than 5 props — if you need more, group into an object or reconsider the split.

## Events / Callbacks

- Prefer callback props (`onSave`, `onDelete`) for parent-child communication.
- Do not reach up into parent state from a child — let the parent decide what happens.

## Naming

- Components: `PascalCase` — `CustomerTable`, `GdprFlagDialog`
- Files: match component name — `CustomerTable.tsx`
- Feature-scoped: group under `components/{feature}/` — `components/customer/CustomerTable.tsx`

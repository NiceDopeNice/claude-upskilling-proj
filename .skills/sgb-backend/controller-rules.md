# Controller Rules

---

## Purpose

Controllers are **request delegation only**. They parse the request and immediately hand off to a service. No business logic lives here.

---

## Rules

- Return type is always `void` for action methods
- Delegate to the service immediately — no logic in the controller
- Guard clauses only for request parsing defaults (never business decisions)
- Comments explain non-obvious defaults or guards
- Never access a repository directly from a controller

---

## Examples

### View action

```php
public function batchReturns(): void
{
    // Processes > Batch Returns breadcrumb trail
    $this->breadcrumbs->add('Processes', '#')->add('Batch Returns', '/');

    $this->layoutService
        ->setTitle('Batch Returns')
        ->setSubHeader('Batch Returns')
        // Load the ES module entry point — wires up all events and UI
        ->addScript('js/module/batch-returns/index.js')
        ->view('bulk/batch-returns');
}
```

### API action

```php
public function validateBatchReturns(): void
{
    // Default to empty so classify() returns all-not-found gracefully
    $orderIds = $this->request->getJsonBody()['order_ids'] ?? [];
    // No writes — classify only
    $this->response->json($this->batchReturnService->classify($orderIds));
}
```

---

## Structure

```php
public function actionName(): void
{
    // 1. Parse request (one line per input, with default)
    $input = $this->request->getJsonBody()['field'] ?? default;

    // 2. Delegate to service (one call)
    $result = $this->service->doSomething($input);

    // 3. Respond
    $this->response->json($result);
}
```

---

## Anti-Patterns

Never:
- Write if/else business logic in a controller
- Loop over data in a controller
- Access a repository from a controller
- Build queries in a controller
- Transform or format data in a controller — that belongs in the service

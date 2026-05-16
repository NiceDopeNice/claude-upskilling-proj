# PHP Conventions

---

## File Header

Every PHP file starts with this exact block:

```php
<?php
/**
 * Upskilling Project
 *
 * @package FileName.php
 * @author [Author Name]
 * @datetime DD/MM/YYYY, HH:MM AM/PM
 */
```

---

## Namespace + Imports

```php
namespace App\Http\Controllers;

// Contracts/interfaces first
use App\Contracts\Services\CustomerServiceInterface;

// Services / Repositories
use App\Services\CustomerService;

// Laravel / vendor
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Exceptions
use Exception;
use RuntimeException;
```

---

## Class Docblock

```php
/**
 * Class CustomerController
 * @package App\Http\Controllers
 */
class CustomerController extends Controller
```

---

## Properties

```php
/**
 * @var CustomerServiceInterface
 */
private readonly CustomerServiceInterface $customerService;
```

---

## Constructor

```php
public function __construct(
    private readonly CustomerServiceInterface $customerService
) {}
```

- One dependency per line
- Always `private readonly` for injected services
- Use promoted properties — no assignments in the body

---

## Method Docblock + Signature

```php
/**
 * @param int $id
 * @return JsonResponse
 * @throws Exception
 */
public function show(int $id): JsonResponse
{
```

- Always `@param` with type and name
- Always `@return`
- `@throws` when the method can throw

---

## Inline Comments

```php
// Fetch only active customers — inactive are excluded from this view
$customers = $this->customerService->getActive();

// Return paginated to avoid payload bloat on large datasets
return CustomerResource::collection($customers);
```

Rules:
- Comments go **above** the line they describe, never trailing
- Explain the **why**, not the what
- Single space after `//`
- Match indentation of the code below

---

## Exception Handling

```php
try {
    $result = $this->customerService->create($data);
} catch (Exception $e) {
    // Caller handles the response — rethrow with context
    throw new RuntimeException("Failed to create customer: {$e->getMessage()}", 0, $e);
}
```

- Catch specific exceptions where possible
- Re-throw as `RuntimeException` when bubbling up
- Log before re-throwing when context is needed

---

## Interface (Contract)

```php
<?php
/**
 * Upskilling Project
 *
 * @package CustomerServiceInterface.php
 * @author [Author Name]
 * @datetime DD/MM/YYYY, HH:MM AM/PM
 */

namespace App\Contracts\Services;

interface CustomerServiceInterface
{
    /**
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getActive(): \Illuminate\Pagination\LengthAwarePaginator;
}
```

- Interface filename matches the concept it contracts
- Stored in `App\Contracts\Services\` or `App\Contracts\Repositories\`
- No `Interface` suffix — just the concept name
- Each method has full PHPDoc

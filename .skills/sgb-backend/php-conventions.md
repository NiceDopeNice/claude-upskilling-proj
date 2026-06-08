# PHP Conventions

---

## File Header

Every PHP file starts with this exact block:

```php
<?php
/**
 * Gracewellness Backend
 *
 * @package FileName.php
 * @author [Author Name]
 * @datetime DD/MM/YYYY, HH:MM AM/PM
 */
```

---

## Namespace + Imports

```php
namespace App\Modules\Generic\Services;

// Contracts/interfaces first
use App\Modules\Generic\Services\Contracts\BatchReturnService as BatchReturnServiceInterface;
use App\Modules\Store\Services\Contracts\OrderService;

// Repositories
use App\Modules\Generic\Repository\BatchReturnRepository;

// Vendor / framework
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Exceptions
use Exception;
use RuntimeException;
```

---

## Class Docblock

```php
/**
 * Class BatchReturnService
 * @package App\Modules\Generic\Services
 */
class BatchReturnService implements BatchReturnServiceInterface
```

---

## Properties

```php
/**
 * @var array
 */
private array $rollbackIdentifiers = [];

/**
 * @var string|null
 */
private ?string $remoteId = null;
```

---

## Constructor

```php
public function __construct(
    private readonly BatchReturnRepository $repository,
    private readonly OrderService $orderService
) {}
```

- One dependency per line
- Always `private readonly` for injected services
- No assignments in the body — use promoted properties

---

## Method Docblock + Signature

```php
/**
 * @param array $orderIds
 * @return array
 * @throws Exception
 */
public function classify(array $orderIds): array
{
```

- Always `@param` with type and name
- Always `@return`
- `@throws` when the method can throw

---

## Inline Comments

```php
// Fetch IDs present in active orders — these are Manual Review
$activeIds = $this->repository->getActiveOrderIds($orderIds);

// Fetch deleted orders with return logs eagerly loaded — avoids N+1
$deletedOrders = $this->repository->getDeletedOrders($orderIds);

// Initialise buckets before the loop so both are always defined regardless of result set
$approvable      = [];
$alreadyApproved = [];

// Classify each deleted order based on whether a return log already exists
foreach ($deletedOrders as $order) {
    if ($order->isReturned()) {
        $alreadyApproved[] = $order->id;
    } else {
        $approvable[] = $order->id;
    }
}
```

Rules:
- Comments go **above** the line they describe, never trailing on the same line
- Explain the **why**, not the what — the code already says what
- Single space after `//`
- Match the indentation of the code below

---

## Array Destructuring

```php
// Multi-value return
[
    $subAccountId, $subAccountIdFormatted, $companyName
] = $this->getRecipientAccount($regionCode, $orderId, $userId);

// Keyed payload extraction
[
    'order_id'    => $orderId,
    'user_id'     => $userId,
    'region_code' => $regionCode,
    'brand'       => $brand
] = $payload;
```

---

## Closures

```php
// Simple factory — use arrow function
$zohoAPIFactory = fn($api) => $this->zohoAPIFactory->makeAbsolute($api);

// Complex logic — use named closure
$getContactPersonsId = function (string $contactId) use ($zohoAPIFactory) {
    $contactPersons = $zohoAPIFactory('contact_persons')->list($contactId);

    return collect($contactPersons)->map(function ($item) {
        return $item['contact_person_id'];
    })->toArray();
};

// Scoped initialization — use IIFE
$contact = (function ($regionCode, $order) use ($zohoAPIFactory) {
    // resolve and return contact
    return $contact;
})($regionCode, $order);

// No $this needed — use static
$mergeName = (static function (string $name, int $append): string {
    if ($append !== 0) {
        return preg_replace("/(\w+)\.(\w+$)/", "\\1_$append.\\2", $name);
    }
    return $name;
})($mergeFile, $key);
```

---

## Exception Handling

```php
try {
    $this->orderService->processReturnTypeUpdate($id, 'set', ['type' => 'return_approved']);
    $approved[] = $id;
} catch (Exception $e) {
    // Logger::log() is already called inside processReturnTypeUpdate on exception
    $failed[] = $id;
}
```

- Catch specific exceptions where possible, `Exception` as fallback
- Re-throw as `RuntimeException` when bubbling up from a service
- Log before re-throwing when context is needed

---

## Logging

```php
// Static log — use self::
self::logZoho('elapsed_time', $orderId, 'export_invoice',
    collect($this->timeElapsed)->toJson()
); // Add log

// Instance log
$this->logCustomerError(
    $customerId,
    $this->getLogTypeForException($exception, 'invoice_creation_failure'),
    Arr::except($this->rollbackIdentifiers, 'customerId'),
    "Failed to create invoice: {$exception->getMessage()}"
);
```

- Trailing `// Add log` comment on the closing `;` line for Zoho log calls
- First arg is always the log type/category
- Context passed as JSON string when needed

---

## Interface (Contract)

```php
<?php
/**
 * Gracewellness Backend
 *
 * @package BatchReturnService.php
 * @author [Author Name]
 * @datetime DD/MM/YYYY, HH:MM AM/PM
 */

namespace App\Modules\Generic\Services\Contracts;

interface BatchReturnService
{
    /**
     * @param array $orderIds
     * @return array
     */
    public function classify(array $orderIds): array;

    /**
     * @param array $orderIds
     * @return array
     */
    public function approve(array $orderIds): array;
}
```

- Interface filename matches the class it contracts
- Stored in `Services/Contracts/` namespace
- No `Interface` suffix — just the concept name
- Each method has full PHPDoc

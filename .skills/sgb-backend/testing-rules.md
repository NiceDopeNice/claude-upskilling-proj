# Testing Rules

---

## Test File Location

Unit tests mirror the source structure:

```txt
application/tests/SLP/Tests/{Module}/
├── {ClassName}UnitTest.php
└── {ClassName}ServiceUnitTest.php
```

---

## Test Class Structure

```php
<?php
/**
 * Gracewellness Backend
 *
 * @package ExampleServiceUnitTest.php
 * @author [Author Name]
 * @datetime DD/MM/YYYY, HH:MM AM/PM
 */

namespace SLP\Tests\Module;

use PHPUnit\Framework\TestCase;

class ExampleServiceUnitTest extends TestCase
{
    private ExampleService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ExampleService(/* inject mocks */);
    }
}
```

---

## Test Method Naming

Pattern: `test_{method}_{scenario}_{expected_outcome}`

```php
public function test_classify_with_active_order_returns_manual_review(): void {}
public function test_classify_with_empty_input_returns_empty_array(): void {}
public function test_approve_when_order_not_found_throws_exception(): void {}
```

---

## Test Structure (Arrange / Act / Assert)

```php
public function test_classify_returns_approvable_for_deleted_order(): void
{
    // Arrange
    $orderIds = [101, 102];
    $this->repository->method('getActiveOrderIds')->willReturn([]);
    $this->repository->method('getDeletedOrders')->willReturn($this->buildDeletedOrders($orderIds));

    // Act
    $result = $this->service->classify($orderIds);

    // Assert
    $this->assertSame($orderIds, $result['approvable']);
    $this->assertEmpty($result['already_approved']);
}
```

---

## Mocking Rules

- Mock at the boundary — repositories and external services only
- Never mock the class under test
- Use `createMock()` or `getMockBuilder()` — not manual stub classes
- Always assert on the result, not just that a method was called

---

## Coverage Expectations

Each test class should cover:
- Happy path (200 / success)
- Empty input / no data
- Partial failure scenarios
- Exception / error paths

---

## Anti-Patterns

Never:
- Test implementation details — test behaviour
- Write tests that only verify a mock was called (no assertion on output)
- Skip the `setUp()` teardown when state could leak between tests
- Write one test that covers multiple unrelated scenarios

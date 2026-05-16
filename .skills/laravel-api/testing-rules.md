# Testing Rules

---

## Test Types

| Type | What it tests | Location |
|---|---|---|
| Unit | Service logic in isolation (mocked repos) | `tests/Unit/` |
| Feature | Full HTTP request → response via routes | `tests/Feature/` |

---

## File Location

```txt
tests/
├── Unit/
│   └── Services/
│       └── CustomerServiceTest.php
└── Feature/
    └── Api/
        └── CustomerTest.php
```

---

## Unit Test Structure

```php
<?php

namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Services\CustomerService;
use App\Contracts\Repositories\CustomerRepositoryInterface;

class CustomerServiceTest extends TestCase
{
    private CustomerService $service;
    private CustomerRepositoryInterface $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->createMock(CustomerRepositoryInterface::class);
        $this->service = new CustomerService($this->repository);
    }
}
```

---

## Feature Test Structure

```php
<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\CustomerProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_active_customers(): void
    {
        CustomerProfile::factory()->count(3)->create(['is_active' => 1]);

        $response = $this->getJson('/api/customers');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }
}
```

---

## Test Method Naming

Pattern: `test_{method}_{scenario}_{expected_outcome}`

```php
public function test_getActive_with_no_customers_returns_empty_collection(): void {}
public function test_create_with_valid_data_returns_customer(): void {}
public function test_store_with_missing_email_returns_422(): void {}
```

---

## Test Structure (Arrange / Act / Assert)

```php
public function test_create_returns_new_customer(): void
{
    // Arrange
    $data = ['name' => 'John', 'email' => 'john@example.com'];
    $this->repository->method('create')->willReturn(new CustomerProfile($data));

    // Act
    $result = $this->service->create($data);

    // Assert
    $this->assertSame('John', $result->name);
}
```

---

## Mocking Rules

- Mock at the boundary — repositories and external services only
- Never mock the class under test
- Use `createMock()` — not manual stub classes
- Always assert on the result, not just that a method was called

---

## Coverage Expectations

Each test class should cover:
- Happy path (200 / success)
- Empty input / no data
- Validation failures (422)
- Not found (404)
- Exception / error paths (500)

---

## Anti-Patterns

Never:
- Test implementation details — test behaviour
- Write tests that only verify a mock was called with no output assertion
- Write one test that covers multiple unrelated scenarios
- Skip `RefreshDatabase` in feature tests that write to the DB

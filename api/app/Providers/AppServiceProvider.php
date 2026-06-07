<?php

namespace App\Providers;

use App\Contracts\Repositories\CustomerRepositoryInterface;
use App\Contracts\Repositories\GdprCustomerRepositoryInterface;
use App\Contracts\Services\CustomerServiceInterface;
use App\Contracts\Services\GdprCustomerServiceInterface;
use App\Repositories\CustomerRepository;
use App\Repositories\GdprCustomerRepository;
use App\Services\CustomerService;
use App\Services\GdprCustomerService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CustomerRepositoryInterface::class, CustomerRepository::class);
        $this->app->bind(CustomerServiceInterface::class, CustomerService::class);
        $this->app->bind(GdprCustomerRepositoryInterface::class, GdprCustomerRepository::class);
        $this->app->bind(GdprCustomerServiceInterface::class, GdprCustomerService::class);
    }

    public function boot(): void
    {
        //
    }
}

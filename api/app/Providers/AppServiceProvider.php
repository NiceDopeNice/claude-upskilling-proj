<?php

/**
 * Upskilling Project
 *
 * @package Providers/AppServiceProvider.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Providers;

use App\Modules\Customer\Repository\Contracts\CustomerRepositoryInterface;
use App\Modules\Customer\Repository\CustomerRepository;
use App\Modules\Customer\Services\Contracts\CustomerServiceInterface;
use App\Modules\Customer\Services\CustomerService;
use App\Modules\Customer\Repository\Contracts\GdprCustomerRepositoryInterface;
use App\Modules\Customer\Repository\GdprCustomerRepository;
use App\Modules\Customer\Services\Contracts\GdprCustomerServiceInterface;
use App\Modules\Customer\Services\GdprCustomerService;
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

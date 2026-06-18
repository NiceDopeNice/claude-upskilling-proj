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
use App\Modules\Customer\Repository\Contracts\InsurancePolicyRepositoryInterface;
use App\Modules\Customer\Repository\InsurancePolicyRepository;
use App\Modules\Customer\Services\Contracts\InsurancePolicyExternalApiInterface;
use App\Modules\Customer\Services\Contracts\InsurancePolicyServiceInterface;
use App\Modules\Customer\Services\InsurancePolicyExternalApiStub;
use App\Modules\Customer\Services\InsurancePolicyService;
use App\Modules\Customer\Repository\Contracts\OrderRepositoryInterface;
use App\Modules\Customer\Repository\OrderRepository;
use App\Modules\Customer\Services\Contracts\OrderServiceInterface;
use App\Modules\Customer\Services\OrderService;
use App\Modules\Customer\Repository\Contracts\SubscriptionRepositoryInterface;
use App\Modules\Customer\Repository\SubscriptionRepository;
use App\Modules\Customer\Services\Contracts\SubscriptionServiceInterface;
use App\Modules\Customer\Services\SubscriptionService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CustomerRepositoryInterface::class, CustomerRepository::class);
        $this->app->bind(CustomerServiceInterface::class, CustomerService::class);
        $this->app->bind(GdprCustomerRepositoryInterface::class, GdprCustomerRepository::class);
        $this->app->bind(GdprCustomerServiceInterface::class, GdprCustomerService::class);
        $this->app->bind(InsurancePolicyRepositoryInterface::class, InsurancePolicyRepository::class);
        $this->app->bind(InsurancePolicyExternalApiInterface::class, InsurancePolicyExternalApiStub::class);
        $this->app->bind(InsurancePolicyServiceInterface::class, InsurancePolicyService::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
        $this->app->bind(OrderServiceInterface::class, OrderService::class);
        $this->app->bind(SubscriptionRepositoryInterface::class, SubscriptionRepository::class);
        $this->app->bind(SubscriptionServiceInterface::class, SubscriptionService::class);
    }

    public function boot(): void
    {
        //
    }
}

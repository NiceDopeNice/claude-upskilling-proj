<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/Contracts/InsurancePolicyServiceInterface.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Services\Contracts;

use App\Modules\Customer\Models\InsurancePolicy;
use Illuminate\Support\Collection;

interface InsurancePolicyServiceInterface
{
    /**
     * @param int $customerId
     * @return Collection
     */
    public function listByCustomer(int $customerId): Collection;

    /**
     * @param int $customerId
     * @param array $data
     * @return array{success: bool, policy: InsurancePolicy|null, message: string}
     */
    public function create(int $customerId, array $data): array;

    /**
     * @param int $customerId
     * @param string $policyId
     * @param string $reason
     * @return array{success: bool, policy: InsurancePolicy|null, message: string}
     */
    public function cancel(int $customerId, string $policyId, string $reason): array;
}

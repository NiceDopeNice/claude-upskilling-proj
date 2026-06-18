<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/Contracts/InsurancePolicyRepositoryInterface.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Repository\Contracts;

use App\Modules\Customer\Models\InsurancePolicy;
use Illuminate\Support\Collection;

interface InsurancePolicyRepositoryInterface
{
    /**
     * @param int $customerId
     * @return Collection
     */
    public function getByCustomer(int $customerId): Collection;

    /**
     * @param array $data
     * @return InsurancePolicy
     */
    public function create(array $data): InsurancePolicy;

    /**
     * @param string $policyId
     * @param int $customerId
     * @return InsurancePolicy|null
     */
    public function findActiveByIdAndCustomer(string $policyId, int $customerId): ?InsurancePolicy;

    /**
     * @param string $policyId
     * @param array $data
     * @return bool
     */
    public function update(string $policyId, array $data): bool;
}

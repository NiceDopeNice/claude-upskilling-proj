<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Repository/InsurancePolicyRepository.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Repository;

use App\Modules\Customer\Models\InsurancePolicy;
use App\Modules\Customer\Repository\Contracts\InsurancePolicyRepositoryInterface;
use Illuminate\Support\Collection;

class InsurancePolicyRepository implements InsurancePolicyRepositoryInterface
{
    public function __construct(
        private readonly InsurancePolicy $model
    ) {}

    /**
     * @param int $customerId
     * @return Collection
     */
    public function getByCustomer(int $customerId): Collection
    {
        return $this->model
            ->where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * @param array $data
     * @return InsurancePolicy
     */
    public function create(array $data): InsurancePolicy
    {
        return $this->model->create($data);
    }

    /**
     * @param string $policyId
     * @param int $customerId
     * @return InsurancePolicy|null
     */
    public function findActiveByIdAndCustomer(string $policyId, int $customerId): ?InsurancePolicy
    {
        return $this->model
            ->where('id', $policyId)
            ->where('customer_id', $customerId)
            ->whereIn('status', ['ACTIVE', 'PENDING'])
            ->first();
    }

    /**
     * @param string $policyId
     * @param array $data
     * @return bool
     */
    public function update(string $policyId, array $data): bool
    {
        return (bool) $this->model->where('id', $policyId)->update($data);
    }
}

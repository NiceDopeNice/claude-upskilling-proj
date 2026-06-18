<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/Contracts/InsurancePolicyExternalApiInterface.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Services\Contracts;

interface InsurancePolicyExternalApiInterface
{
    /**
     * @param array $policyData
     * @return array{success: bool, remote_id: string|null, message: string}
     */
    public function registerPolicy(array $policyData): array;

    /**
     * @param string $policyId
     * @param string $reason
     * @return array{success: bool, message: string}
     */
    public function cancelPolicy(string $policyId, string $reason): array;
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Services/InsurancePolicyExternalApiStub.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Services;

use App\Modules\Customer\Services\Contracts\InsurancePolicyExternalApiInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InsurancePolicyExternalApiStub implements InsurancePolicyExternalApiInterface
{
    /**
     * Simulates registering a policy with the external insurance provider.
     *
     * @param array $policyData
     * @return array{success: bool, remote_id: string|null, message: string}
     */
    public function registerPolicy(array $policyData): array
    {
        // Simulate an external API call — logs intent for auditability
        Log::info('InsurancePolicyExternalApi::registerPolicy', [
            'customer_id' => $policyData['customer_id'] ?? null,
            'product'     => $policyData['product'] ?? null,
            'start_date'  => $policyData['start_date'] ?? null,
        ]);

        return [
            'success'   => true,
            'remote_id' => 'EXT-' . strtoupper(Str::random(10)),
            'message'   => 'Policy registered with external provider.',
        ];
    }

    /**
     * Simulates cancelling a policy with the external insurance provider.
     *
     * @param string $policyId
     * @param string $reason
     * @return array{success: bool, message: string}
     */
    public function cancelPolicy(string $policyId, string $reason): array
    {
        // Simulate an external API call — logs intent for auditability
        Log::info('InsurancePolicyExternalApi::cancelPolicy', [
            'policy_id' => $policyId,
            'reason'    => $reason,
        ]);

        return [
            'success' => true,
            'message' => 'Policy cancellation confirmed by external provider.',
        ];
    }
}

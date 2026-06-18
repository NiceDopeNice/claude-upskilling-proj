<?php

/**
 * Upskilling Project
 *
 * @package Http/Requests/CreateInsurancePolicyRequest.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Http\Requests;

use App\Modules\Customer\Enums\InsuranceProduct;
use App\Modules\Customer\Enums\InsuranceRelationship;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateInsurancePolicyRequest extends FormRequest
{
    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'product'      => ['required', Rule::enum(InsuranceProduct::class)],
            'start_date'   => ['required', 'date'],
            'end_date'     => ['nullable', 'date', 'after_or_equal:start_date'],
            'relationship' => ['nullable', Rule::enum(InsuranceRelationship::class)],
        ];
    }
}

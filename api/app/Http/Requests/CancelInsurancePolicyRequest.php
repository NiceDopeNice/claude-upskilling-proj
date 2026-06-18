<?php

/**
 * Upskilling Project
 *
 * @package Http/Requests/CancelInsurancePolicyRequest.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelInsurancePolicyRequest extends FormRequest
{
    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'max:500'],
        ];
    }
}

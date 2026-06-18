<?php

/**
 * Upskilling Project
 *
 * @package Http/Requests/DeactivateSubscriptionRequest.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeactivateSubscriptionRequest extends FormRequest
{
    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'cancel_reason'   => ['required', 'string', 'max:500'],
            'cancel_method'   => ['nullable', 'string', 'max:100'],
            'cancel_category' => ['nullable', 'string', 'max:100'],
        ];
    }
}

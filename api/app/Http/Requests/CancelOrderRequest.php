<?php

/**
 * Upskilling Project
 *
 * @package Http/Requests/CancelOrderRequest.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelOrderRequest extends FormRequest
{
    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'cancel_reason'    => ['required', 'string', 'max:500'],
            'cancel_category'  => ['nullable', 'string', 'max:100'],
            'cancel_reception' => ['nullable', 'string', 'max:100'],
        ];
    }
}

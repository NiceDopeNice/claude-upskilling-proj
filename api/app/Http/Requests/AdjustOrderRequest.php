<?php

/**
 * Upskilling Project
 *
 * @package Http/Requests/AdjustOrderRequest.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustOrderRequest extends FormRequest
{
    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'type'   => ['required', 'in:fee,discount'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}

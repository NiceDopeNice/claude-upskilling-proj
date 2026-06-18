<?php

/**
 * Upskilling Project
 *
 * @package Http/Requests/UpdateNextShipmentRequest.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNextShipmentRequest extends FormRequest
{
    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'next_shipment' => ['required', 'date', 'after_or_equal:today'],
        ];
    }
}

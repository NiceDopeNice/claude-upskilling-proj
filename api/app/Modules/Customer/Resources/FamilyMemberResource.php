<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/FamilyMemberResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FamilyMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'customer_id' => $this->customer_id,
            'ssn'         => $this->ssn,
            'first_name'  => $this->first_name,
            'last_name'   => $this->last_name,
            'phone'       => $this->phone,
            'email'       => $this->email,
            'street'      => $this->street,
            'zip_code'    => $this->zip_code,
            'city'        => $this->city,
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}

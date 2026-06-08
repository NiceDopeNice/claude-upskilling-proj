<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/BlockedSsnResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlockedSsnResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'ssn'        => $this->ssn,
            'reason'     => $this->reason,
            'added_by'   => $this->added_by,
            'date_added' => $this->created_at?->toDateString(),
        ];
    }
}

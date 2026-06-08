<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/SinfridPolicyResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SinfridPolicyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'account_id'    => $this->account_id,
            'policy_number' => $this->policy_number,
            'type'          => $this->type,
            'insurer'       => $this->insurer,
            'status'        => $this->status,
            'start_date'    => $this->start_date?->toDateString(),
            'end_date'      => $this->end_date?->toDateString(),
            'cancelled_at'  => $this->cancelled_at?->toDateTimeString(),
            'cancel_reason' => $this->cancel_reason,
            'created_at'    => $this->created_at?->toDateTimeString(),
        ];
    }
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/InsurancePolicyResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InsurancePolicyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'uuid'              => $this->uuid,
            'customer_id'       => $this->customer_id,
            'product'           => $this->product instanceof \BackedEnum ? $this->product->value : $this->product,
            'start_date'        => $this->start_date?->toDateString(),
            'end_date'          => $this->end_date?->toDateString(),
            'partner_reference' => $this->partner_reference,
            'relationship'      => $this->relationship instanceof \BackedEnum ? $this->relationship->value : $this->relationship,
            'status'            => $this->status,
            'cancel_reason'     => $this->cancel_reason ?? null,
            'cancelled_at'      => $this->cancelled_at ?? null,
            'source'            => $this->source,
            'created_at'        => $this->created_at?->toDateTimeString(),
        ];
    }
}

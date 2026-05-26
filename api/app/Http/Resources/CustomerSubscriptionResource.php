<?php

/**
 * Upskilling Project
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerSubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'active'          => (bool) ($this->active ?? false),
            'cancel_method'   => $this->cancel_method ?? null,
            'cancel_category' => $this->cancel_category ?? null,
            'cancel_reason'   => $this->cancel_reason ?? null,
            'payment_type'    => $this->payment_type ?? null,
            'remote_id'       => $this->remote_id ?? null,
            'subscription_id' => $this->subscription_id ?? null,
            'next_shipment'   => $this->next_shipment ?? null,
            'date_started'    => $this->date_started ?? null,
            'date_cancelled'  => $this->date_cancelled ?? null,
            'ref'             => $this->ref ?? null,
            'ref1'            => $this->ref1 ?? null,
        ];
    }
}

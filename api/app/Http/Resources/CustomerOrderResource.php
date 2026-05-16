<?php

/**
 * Upskilling Project
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = 'pending';
        if ($this->is_shipped) {
            $status = 'shipped';
        } elseif ($this->is_paid) {
            $status = 'paid';
        } elseif ($this->is_processed) {
            $status = 'processed';
        }

        return [
            'id'             => $this->id,
            'date_added'     => $this->date_added,
            'date_shipped'   => $this->date_shipped,
            'date_paid'      => $this->date_paid,
            'total'          => round((float) ($this->total ?? 0), 2),
            'payment_method' => $this->payment_method,
            'status'         => $status,
            'ref'            => $this->ref,
            'prod_id'        => $this->prod_id,
            'subscription_id'=> $this->subscription_id,
        ];
    }
}

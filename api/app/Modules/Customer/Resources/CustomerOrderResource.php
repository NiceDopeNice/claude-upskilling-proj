<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/CustomerOrderResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

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
            'id'              => $this->id,
            'date_added'      => $this->date_added,
            'date_shipped'    => $this->date_shipped,
            'date_paid'       => $this->date_paid,
            'total'           => round((float) ($this->total ?? 0), 2),
            'payment_method'  => $this->payment_method,
            'status'          => $status,
            'is_shipped'      => (bool) ($this->is_shipped ?? false),
            'is_paid'         => (bool) ($this->is_paid ?? false),
            'is_processed'    => (bool) ($this->is_processed ?? false),
            'ref'             => $this->ref,
            'ref1'            => $this->ref1 ?? null,
            'prod_id'         => $this->prod_id,
            'subscription_id' => $this->subscription_id,
            'origin'          => $this->origin ?? null,
            'return_type'     => $this->return_type ?? null,
            'state'           => 'approved',
        ];
    }
}

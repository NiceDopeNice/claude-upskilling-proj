<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/CustomerOrderDeletedResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerOrderDeletedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'date_added'       => $this->date_added,
            'date_shipped'     => $this->date_shipped,
            'date_deleted'     => $this->date_deleted ?? null,
            'date_paid'        => $this->date_paid ?? null,
            'total'            => round((float) ($this->total ?? 0), 2),
            'payment_method'   => $this->payment_method,
            'ref'              => $this->ref,
            'ref1'             => $this->ref1 ?? null,
            'prod_id'          => $this->prod_id,
            'subscription_id'  => $this->subscription_id,
            'origin'           => $this->origin ?? null,
            'return_type'      => $this->return_type ?? null,
            'cancel_reason'    => $this->cancel_reason ?? null,
            'cancel_category'  => $this->cancel_category ?? null,
            'cancel_reception' => $this->cancel_reception ?? null,
            'state'            => 'deleted',
        ];
    }
}

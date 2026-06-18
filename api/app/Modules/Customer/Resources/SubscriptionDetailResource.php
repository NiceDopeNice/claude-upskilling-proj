<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/SubscriptionDetailResource.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionDetailResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->resource['id'],
            'active'            => (bool) ($this->resource['active'] ?? false),
            'payment_type'      => $this->resource['payment_type'] ?? null,
            'remote_id'         => $this->resource['remote_id'] ?? null,
            'subscription_id'   => $this->resource['subscription_id'] ?? null,
            'next_shipment'     => $this->resource['next_shipment'] ?? null,
            'date_started'      => $this->resource['date_started'] ?? null,
            'date_cancelled'    => $this->resource['date_cancelled'] ?? null,
            'cancel_method'     => $this->resource['cancel_method'] ?? null,
            'cancel_category'   => $this->resource['cancel_category'] ?? null,
            'cancel_reason'     => $this->resource['cancel_reason'] ?? null,
            'ref'               => $this->resource['ref'] ?? null,
            'ref1'              => $this->resource['ref1'] ?? null,
            'pre_finance_count' => (int) ($this->resource['pre_finance_count'] ?? 0),
        ];
    }
}

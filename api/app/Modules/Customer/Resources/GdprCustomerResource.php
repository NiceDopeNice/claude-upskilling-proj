<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/GdprCustomerResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GdprCustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $resource = $this->resource;

        // Works with both Eloquent model (from single actions) and stdClass (from listing query)
        $get = fn(string $key) => is_array($resource)
            ? ($resource[$key] ?? null)
            : (is_object($resource) ? ($resource->$key ?? null) : null);

        $status = $get('status');
        $type   = $get('exclusion_type');

        return [
            'id'             => $get('id'),
            'customer_id'    => $get('customer_id'),
            'customer_name'  => trim(($get('first_name') ?? '') . ' ' . ($get('last_name') ?? '')),
            'customer_email' => $get('email'),
            'status'         => is_object($status) ? $status->value : $status,
            'exclusion_type' => is_object($type) ? $type->value : $type,
            'flagged_at'     => $get('flagged_at'),
            'anonymized_at'  => $get('anonymized_at'),
            'restored_at'    => $get('restored_at'),
            'requested_by'   => $get('requested_by'),
            'source'         => $get('source'),
            'created_at'     => $get('created_at'),
            'updated_at'     => $get('updated_at'),
        ];
    }
}

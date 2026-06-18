<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/OrderDetailResource.php
 * @author John Dagocdocan
 * @datetime 09/06/2026, 10:00 AM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        $status = 'pending';
        if ($this->resource['is_shipped'] ?? false) {
            $status = 'shipped';
        } elseif ($this->resource['is_paid'] ?? false) {
            $status = 'paid';
        } elseif ($this->resource['is_processed'] ?? false) {
            $status = 'processed';
        }

        // Cart is stored as a serialized/JSON string — decode defensively
        $cart = null;
        if (!empty($this->resource['cart'])) {
            $decoded = json_decode($this->resource['cart'], true);
            $cart = json_last_error() === JSON_ERROR_NONE ? $decoded : $this->resource['cart'];
        }

        return [
            'id'                     => $this->resource['id'],
            'customer_id'            => $this->resource['by_user'],
            'customer_name'          => $this->resource['customer_name'] ?? null,
            'customer_email'         => $this->resource['customer_email'] ?? null,
            'ref'                    => $this->resource['ref'] ?? null,
            'ref1'                   => $this->resource['ref1'] ?? null,
            'date_added'             => $this->resource['date_added'] ?? null,
            'date_shipped'           => $this->resource['date_shipped'] ?? null,
            'date_paid'              => $this->resource['date_paid'] ?? null,
            'date_purchased'         => $this->resource['date_purchased'] ?? null,
            'total'                  => round((float) ($this->resource['total'] ?? 0), 2),
            'total_vat'              => round((float) ($this->resource['total_vat'] ?? 0), 2),
            'total_excluding_vat'    => round((float) ($this->resource['total_excluding_vat'] ?? 0), 2),
            'total_with_coupon'      => round((float) ($this->resource['total_with_coupon'] ?? 0), 2),
            'coupon'                 => $this->resource['coupon'] ?? null,
            'payment_method'         => $this->resource['payment_method'] ?? null,
            'status'                 => $status,
            'is_processed'           => (bool) ($this->resource['is_processed'] ?? false),
            'is_shipped'             => (bool) ($this->resource['is_shipped'] ?? false),
            'is_paid'                => (bool) ($this->resource['is_paid'] ?? false),
            'prod_id'                => $this->resource['prod_id'] ?? null,
            'subscription_id'        => $this->resource['subscription_id'] ?? null,
            'invoice_no'             => $this->resource['invoice_no'] ?? null,
            'shipment_center'        => $this->resource['shipment_center'] ?? null,
            'region_code'            => $this->resource['region_code'] ?? null,
            'parcel_tracking_id'     => $this->resource['parcel_tracking_id'] ?? null,
            'is_pre_financed'        => (bool) ($this->resource['is_pre_financed'] ?? false),
            'company_name'           => $this->resource['company_name'] ?? null,
            'origin'                 => $this->resource['origin'] ?? null,
            'batch'                  => $this->resource['batch'] ?? null,
            'cart'                   => $cart,
            'adjustments'            => $this->resource['adjustments'] ?? [],
        ];
    }
}

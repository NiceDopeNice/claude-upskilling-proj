<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/CustomerDetailResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // blocked_fees: raw DB query returns JSON string; Eloquent returns array
        $blockedFees = $this->blocked_fees;
        if (is_string($blockedFees)) {
            $blockedFees = json_decode($blockedFees, true);
        }
        if (!is_array($blockedFees)) {
            $blockedFees = [];
        }

        return [
            'id'                 => $this->to_user,
            'customer_no'        => $this->to_user,
            'first_name'         => $this->first_name,
            'last_name'          => $this->last_name,
            'email'              => $this->email,
            'alternative_email'  => $this->alternative_email,
            'tel'                => $this->tel,
            'alternative_tel'    => $this->alternative_tel,
            'pers_nr'            => $this->pers_nr,
            'sex'                => $this->sex ?? 'unknown',
            'birthdate'          => $this->birthdate,
            'careof'             => $this->careof,
            'adress'             => $this->adress,
            'post_nr'            => $this->post_nr,
            'ort'                => $this->ort,
            'region_code'        => $this->region_code,
            'sync'               => (bool) ($this->sync ?? true),
            'credit_check'       => $this->credit_check !== null ? (int) $this->credit_check : null,
            'payment_preference' => $this->payment_preference,
            'delivery_method'    => $this->delivery_method,
            'date_added'         => $this->date_added,
            'ltv'                => round((float) ($this->ltv ?? 0), 2),
            'order_count'        => (int) ($this->order_count ?? 0),
            'last_order_date'    => $this->last_order_date,
            'do_not_call'        => (bool) $this->do_not_call,
            'difficult_customer' => (bool) $this->difficult_customer,
            'blocked_fees'       => $blockedFees,
            'block_email'        => (bool) $this->block_email,
            'block_gdpr'         => (bool) $this->block_gdpr,
            'block_dm'           => (bool) $this->block_dm,
            'household_adults'   => $this->household_adults !== null ? (int) $this->household_adults : null,
            'household_children' => $this->household_children !== null ? (int) $this->household_children : null,
            'reminders'          => (bool) $this->reminders,
        ];
    }
}

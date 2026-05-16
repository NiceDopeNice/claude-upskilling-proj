<?php

/**
 * Upskilling Project
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // blocked_fees is a JSON array — treat as flagged when not empty
        $blockedFees = $this->blocked_fees;
        if (is_string($blockedFees)) {
            $blockedFees = json_decode($blockedFees, true);
        }
        $isBlockedFees = !empty($blockedFees);

        return [
            'id'                => $this->to_user,
            'customer_no'       => $this->to_user,
            'first_name'        => $this->first_name,
            'last_name'         => $this->last_name,
            'email'             => $this->email,
            'alternative_email' => $this->alternative_email,
            'tel'               => $this->tel,
            'alternative_tel'   => $this->alternative_tel,
            'pers_nr'           => $this->pers_nr,
            'adress'            => $this->adress,
            'post_nr'           => $this->post_nr,
            'ort'               => $this->ort,
            'region_code'       => $this->region_code,
            'date_added'        => $this->date_added,
            'ltv'               => round((float) ($this->ltv ?? 0), 2),
            'order_count'       => (int) ($this->order_count ?? 0),
            'last_order_date'   => $this->last_order_date,
            'do_not_call'       => (bool) $this->do_not_call,
            'difficult_customer'=> (bool) $this->difficult_customer,
            'blocked_fees'      => $isBlockedFees,
            'block_email'       => (bool) $this->block_email,
            'block_gdpr'        => (bool) $this->block_gdpr,
            'block_dm'          => (bool) $this->block_dm,
        ];
    }
}

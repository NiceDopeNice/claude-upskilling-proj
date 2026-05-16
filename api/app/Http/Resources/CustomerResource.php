<?php

/**
 * Upskilling Project
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->to_user,
            'customer_no'     => $this->to_user,
            'first_name'      => $this->first_name,
            'last_name'       => $this->last_name,
            'email'           => $this->email,
            'tel'             => $this->tel,
            'pers_nr'         => $this->pers_nr,
            'adress'          => $this->adress,
            'ort'             => $this->ort,
            'last_order_date' => $this->last_order_date,
            'sinfrid_id'      => $this->sinfrid_id,
        ];
    }
}

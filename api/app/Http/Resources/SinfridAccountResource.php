<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SinfridAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'uuid'             => $this->uuid,
            'customer_id'      => $this->customer_id,
            'type'             => $this->type,
            'plan_id'          => $this->plan_id,
            'first_name'       => $this->first_name,
            'last_name'        => $this->last_name,
            'email'            => $this->email,
            'phone'            => $this->phone,
            'city'             => $this->city,
            'street'           => $this->street,
            'zipcode'          => $this->zipcode,
            'lang_code'        => $this->lang_code,
            'country_code'     => $this->country_code,
            'activation_date'  => $this->activation_date?->toDateString(),
            'email_confirmed'  => (bool) $this->email_confirmed,
            'phone_confirmed'  => (bool) $this->phone_confirmed,
            'status'           => (bool) $this->status,
            'last_login_at'    => $this->last_login_at?->toDateTimeString(),
            'deactivated_at'   => $this->deactivated_at?->toDateTimeString(),
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}

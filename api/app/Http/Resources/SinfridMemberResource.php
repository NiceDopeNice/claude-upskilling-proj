<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SinfridMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'uuid'            => $this->uuid,
            'account_id'      => $this->account_id,
            'ssn'             => $this->ssn,
            'first_name'      => $this->first_name,
            'last_name'       => $this->last_name,
            'email'           => $this->email,
            'phone'           => $this->phone,
            'city'            => $this->city,
            'street'          => $this->street,
            'zipcode'         => $this->zipcode,
            'lang_code'       => $this->lang_code,
            'country_code'    => $this->country_code,
            'email_confirmed' => (bool) $this->email_confirmed,
            'phone_confirmed' => (bool) $this->phone_confirmed,
            'status'          => (bool) $this->status,
            'deactivated_at'  => $this->deactivated_at?->toDateTimeString(),
            'created_at'      => $this->created_at?->toDateTimeString(),
        ];
    }
}

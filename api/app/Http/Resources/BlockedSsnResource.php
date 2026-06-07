<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlockedSsnResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'ssn'        => $this->ssn,
            'reason'     => $this->reason,
            'added_by'   => $this->added_by,
            'date_added' => $this->created_at?->toDateString(),
        ];
    }
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Resources/SinfridAlarmResource.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SinfridAlarmResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'account_id'          => $this->account_id,
            'text'                => $this->text,
            'severity'            => $this->severity,
            'status'              => $this->status,
            'category'            => $this->category,
            'source'              => $this->source,
            'coachme_available'   => (bool) $this->coachme_available,
            'coachme_description' => $this->coachme_description,
            'date'                => $this->date?->toDateTimeString(),
            'created_at'          => $this->created_at?->toDateTimeString(),
        ];
    }
}

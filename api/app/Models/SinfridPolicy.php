<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SinfridPolicy extends Model
{
    protected $table = 'sinfrid_policies';

    protected $fillable = [
        'account_id', 'policy_number', 'type', 'insurer',
        'status', 'start_date', 'end_date', 'cancelled_at', 'cancel_reason',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'cancelled_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(SinfridAccount::class, 'account_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SinfridMemberAlarm extends Model
{
    protected $table = 'sinfrid_member_alarms';

    public $timestamps = false;

    protected $fillable = [
        'account_id', 'text', 'severity', 'status', 'category',
        'source', 'coachme_available', 'coachme_description', 'date',
    ];

    protected $casts = [
        'coachme_available' => 'boolean',
        'date'              => 'datetime',
        'created_at'        => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(SinfridAccount::class, 'account_id');
    }
}

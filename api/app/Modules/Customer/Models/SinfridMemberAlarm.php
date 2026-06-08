<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/SinfridMemberAlarm.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

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

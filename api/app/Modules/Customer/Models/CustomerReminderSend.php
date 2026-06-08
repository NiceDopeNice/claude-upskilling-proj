<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/CustomerReminderSend.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerReminderSend extends Model
{
    protected $table    = 'customer_reminder_sends';
    public const UPDATED_AT = null;

    protected $fillable = [
        'reminder_id', 'channel', 'sent_at',
        'status', 'skip_reason', 'provider_message_id', 'error_message',
    ];

    public function reminder(): BelongsTo
    {
        return $this->belongsTo(CustomerReminder::class, 'reminder_id');
    }
}

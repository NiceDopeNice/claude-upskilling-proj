<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerReminderSend extends Model
{
    protected $table = 'customer_reminder_sends';

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

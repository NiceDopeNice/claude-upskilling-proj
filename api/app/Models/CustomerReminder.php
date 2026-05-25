<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerReminder extends Model
{
    protected $table = 'customer_reminders';

    protected $fillable = [
        'customer_id', 'type_code', 'brand',
        'send_sms', 'send_email',
        'interval_months', 'start_date', 'next_reminder_at',
        'is_active', 'last_sent_at', 'last_send_status',
        'consecutive_failures', 'deactivated_at', 'deactivated_reason',
        'created_by',
    ];

    protected $casts = [
        'send_sms'             => 'boolean',
        'send_email'           => 'boolean',
        'is_active'            => 'boolean',
        'consecutive_failures' => 'integer',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(CustomerReminderType::class, 'type_code', 'code');
    }

    public function sends(): HasMany
    {
        return $this->hasMany(CustomerReminderSend::class, 'reminder_id');
    }
}

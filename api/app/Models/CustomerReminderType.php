<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerReminderType extends Model
{
    protected $table = 'customer_reminder_types';

    protected $fillable = [
        'code', 'label_en', 'label_sv',
        'default_interval_months', 'min_interval_months', 'max_interval_months',
        'supported_brands', 'metadata', 'status',
    ];

    protected $casts = [
        'supported_brands' => 'array',
        'metadata'         => 'array',
        'status'           => 'boolean',
    ];
}

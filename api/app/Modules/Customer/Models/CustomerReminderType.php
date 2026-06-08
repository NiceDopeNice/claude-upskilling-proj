<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/CustomerReminderType.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

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

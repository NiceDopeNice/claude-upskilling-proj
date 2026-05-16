<?php

/**
 * Upskilling Project
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerProfileExtra extends Model
{
    protected $table = 'customer_profile_extras';
    public $timestamps = false;

    protected $fillable = [
        'customer_id', 'block_email', 'block_gdpr', 'block_dm',
        'date_cancelled', 'trial_sinfrid', 'stowaway',
        'payment_preference', 'delivery_method', 'metadata', 'last_open_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'block_email' => 'boolean',
        'block_gdpr' => 'boolean',
        'block_dm' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_id', 'to_user');
    }
}

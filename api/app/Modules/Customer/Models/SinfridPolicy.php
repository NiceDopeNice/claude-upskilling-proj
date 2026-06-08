<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/SinfridPolicy.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SinfridPolicy extends Model
{
    protected $table = 'sinfrid_policies';

    protected $fillable = [
        'account_id', 'product', 'status', 'start_date', 'end_date',
        'external_policy_id', 'metadata',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(SinfridAccount::class, 'account_id');
    }
}

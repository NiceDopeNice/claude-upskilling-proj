<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/SinfridAccountMember.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SinfridAccountMember extends Model
{
    use SoftDeletes;

    protected $table = 'sinfrid_account_members';

    protected $fillable = [
        'uuid', 'account_id', 'ssn', 'first_name', 'last_name',
        'email', 'phone', 'city', 'street', 'zipcode',
        'lang_code', 'country_code', 'email_confirmed', 'phone_confirmed',
        'status', 'deactivated_at',
    ];

    protected $casts = [
        'email_confirmed' => 'boolean',
        'phone_confirmed' => 'boolean',
        'status'          => 'boolean',
        'deactivated_at'  => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(SinfridAccount::class, 'account_id');
    }
}

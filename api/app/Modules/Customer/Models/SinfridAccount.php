<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/SinfridAccount.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SinfridAccount extends Model
{
    use SoftDeletes;

    protected $table = 'sinfrid_accounts';

    protected $fillable = [
        'uuid', 'customer_id', 'type', 'plan_id',
        'first_name', 'last_name', 'email', 'phone',
        'city', 'street', 'zipcode', 'lang_code', 'country_code',
        'activation_date', 'email_confirmed', 'phone_confirmed',
        'status', 'last_login_at', 'deactivated_at',
    ];

    protected $casts = [
        'email_confirmed' => 'boolean',
        'phone_confirmed' => 'boolean',
        'status'          => 'boolean',
        'activation_date' => 'date',
        'last_login_at'   => 'datetime',
        'deactivated_at'  => 'datetime',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(SinfridAccountMember::class, 'account_id');
    }

    public function alarms(): HasMany
    {
        return $this->hasMany(SinfridMemberAlarm::class, 'account_id');
    }

    public function policies(): HasMany
    {
        return $this->hasMany(SinfridPolicy::class, 'account_id');
    }
}

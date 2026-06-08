<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/FamilyMember.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use App\Modules\Customer\Models\CustomerProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyMember extends Model
{
    protected $table = 'family_members';

    protected $fillable = [
        'customer_id', 'ssn', 'first_name', 'last_name',
        'phone', 'email', 'street', 'zip_code', 'city',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_id', 'to_user');
    }
}

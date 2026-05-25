<?php

/**
 * Upskilling Project
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerProfile extends Model
{
    protected $table = 'customer_profile';
    protected $primaryKey = 'to_user';
    public const CREATED_AT = null;

    protected $fillable = [
        'to_user', 'first_name', 'last_name', 'email', 'alternative_email',
        'tel', 'alternative_tel', 'pers_nr', 'adress', 'post_nr', 'ort',
        'region_code', 'do_not_call', 'difficult_customer', 'blocked_fees',
        'organization_id',
    ];

    protected $casts = [
        'blocked_fees' => 'array',
    ];

    public function extra(): HasOne
    {
        return $this->hasOne(CustomerProfileExtra::class, 'customer_id', 'to_user');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'by_user', 'to_user');
    }
}

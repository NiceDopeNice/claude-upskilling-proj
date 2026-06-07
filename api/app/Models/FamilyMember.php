<?php

namespace App\Models;

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

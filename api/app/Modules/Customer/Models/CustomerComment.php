<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/CustomerComment.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerComment extends Model
{
    protected $table = 'customer_comments';

    protected $fillable = ['customer_id', 'message', 'brand', 'initiator'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_id', 'to_user');
    }
}

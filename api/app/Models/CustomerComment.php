<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerComment extends Model
{
    protected $table = 'customer_comments';

    protected $fillable = [
        'customer_id', 'message', 'brand', 'initiator',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_id', 'to_user');
    }
}

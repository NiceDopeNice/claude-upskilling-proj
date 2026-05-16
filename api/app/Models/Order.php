<?php

/**
 * Upskilling Project
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $table = 'orders';
    public $timestamps = false;

    protected $fillable = [
        'by_user', 'date_added', 'date_shipped', 'date_paid',
        'total', 'payment_method', 'is_processed', 'is_shipped', 'is_paid',
        'ref', 'prod_id', 'subscription_id', 'region_code',
    ];

    protected $casts = [
        'is_processed' => 'boolean',
        'is_shipped' => 'boolean',
        'is_paid' => 'boolean',
        'total' => 'float',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class, 'by_user', 'to_user');
    }
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/CustomerChange.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerChange extends Model
{
    protected $table      = 'customer_changes';
    protected $primaryKey = 'change_id';
    public $timestamps    = false;

    protected $fillable = [
        'change_initiator_user_id', 'change_date', 'change_batch_id',
        'change_user_id', 'change_action', 'change_field',
        'change_old_value', 'change_new_value',
    ];

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'change_initiator_user_id', 'id');
    }
}

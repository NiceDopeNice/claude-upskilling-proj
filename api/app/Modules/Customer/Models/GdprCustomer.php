<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/GdprCustomer.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use App\Modules\Customer\Enums\GdprExclusionType;
use App\Modules\Customer\Enums\GdprStatus;
use App\Modules\Customer\Models\CustomerProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GdprCustomer extends Model
{
    protected $table = 'gdpr_customers';

    protected $fillable = [
        'uuid', 'customer_id', 'status', 'exclusion_type',
        'flagged_at', 'anonymized_at', 'restored_at', 'requested_by', 'source',
    ];

    protected $casts = [
        'status'         => GdprStatus::class,
        'exclusion_type' => GdprExclusionType::class,
        'flagged_at'     => 'datetime',
        'anonymized_at'  => 'datetime',
        'restored_at'    => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(function (GdprCustomer $model) {
            if ($model->isDirty('status')) {
                $status = $model->status;
                if ($status === GdprStatus::Anonymized && !$model->anonymized_at) {
                    $model->anonymized_at = now();
                }
                if ($status === GdprStatus::Restored && !$model->restored_at) {
                    $model->restored_at = now();
                }
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_id', 'to_user');
    }
}


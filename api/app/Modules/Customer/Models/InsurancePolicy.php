<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/InsurancePolicy.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use App\Modules\Customer\Enums\InsuranceProduct;
use App\Modules\Customer\Enums\InsuranceRelationship;
use Illuminate\Database\Eloquent\Model;

class InsurancePolicy extends Model
{
    protected $table = 'insurance_policies';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'uuid', 'customer_id', 'request_id', 'external_customer_id',
        'product', 'start_date', 'end_date', 'partner_reference',
        'metadata', 'relationship', 'status', 'source',
    ];

    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'product'      => InsuranceProduct::class,
        'relationship' => InsuranceRelationship::class,
    ];
}


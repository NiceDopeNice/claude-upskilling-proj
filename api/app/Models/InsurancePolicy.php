<?php

namespace App\Models;

use App\Enums\InsuranceProduct;
use App\Enums\InsuranceRelationship;
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

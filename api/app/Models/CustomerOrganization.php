<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerOrganization extends Model
{
    protected $table = 'customer_organizations';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'contact_email', 'invoice_email'];
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/CustomerOrganization.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerOrganization extends Model
{
    protected $table    = 'customer_organizations';
    public $incrementing = false;
    protected $keyType  = 'string';

    protected $fillable = ['id', 'name', 'contact_email', 'invoice_email'];
}

<?php

/**
 * Upskilling Project
 *
 * @package Modules/Customer/Models/BlockedSsn.php
 * @author John Dagocdocan
 * @datetime 08/06/2026, 12:00 PM
 */

namespace App\Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;

class BlockedSsn extends Model
{
    protected $table = 'blocked_ssns';

    protected $fillable = ['ssn', 'reason', 'added_by'];
}

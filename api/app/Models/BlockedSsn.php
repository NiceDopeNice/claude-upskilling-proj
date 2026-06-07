<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockedSsn extends Model
{
    protected $table = 'blocked_ssns';

    protected $fillable = ['ssn', 'reason', 'added_by'];
}

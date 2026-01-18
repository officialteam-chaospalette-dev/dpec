<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLog extends Model
{
    protected $fillable = [
        'session_id',
        'event_type',
        'timestamp',
        'data'
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'data' => 'array'
    ];
}


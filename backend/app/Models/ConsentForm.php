<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsentForm extends Model
{
    protected $fillable = [
        'participant_id',
        'consent_checks',
        'risk_understanding',
        'ec_usage_frequency',
        'name',
        'vision',
        'final_consent',
        'session_id'
    ];

    protected $casts = [
        'consent_checks' => 'array'
    ];
}



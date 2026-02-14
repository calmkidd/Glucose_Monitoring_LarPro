<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BloodGlucoseLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id', 
        'value', 
        'recorded_at'
    ];

    protected $casts = [
    'recorded_at' => 'datetime',
    ];
    
    // Matikan timestamps jika tabel Anda tidak punya created_at/updated_at
    public $timestamps = false; 
}
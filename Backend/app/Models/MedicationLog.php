<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MedicationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id', 
        'medication_name', 
        'dosage', 
        'time_of_day',
        'taken_at'
    ];
}
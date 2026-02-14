<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SymptomLog extends Model
{
    use HasFactory;

    // Tambahkan semua kolom ini agar tidak error 'Mass Assignment'
    protected $fillable = [
        'patient_id',
        'hypo_symptoms',
        'hyper_symptoms',
        'severity',
        'risk_label',
        'conditions',
        'note',
        'recorded_at'
    ];

    // Jika Anda tidak menggunakan kolom created_at/updated_at default
    public $timestamps = true;
}
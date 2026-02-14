<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Patient extends Model
{
    // Pastikan fillable sesuai dengan kolom di database
    protected $fillable = ['name', 'rm']; 

    /**
     * Relasi ke semua data gula darah
     */
    public function bloodGlucoses(): HasMany
    {
        // Pastikan nama modelnya BloodGlucoseLog sesuai file yang kita temukan tadi
        return $this->hasMany(BloodGlucoseLog::class, 'patient_id', 'id');
    }

    /**
     * Relasi khusus untuk mengambil 1 data gula darah TERBARU
     * Inilah yang dicari oleh Controller kamu
     */
    public function latestGlucose(): HasOne
    {
        return $this->hasOne(BloodGlucoseLog::class, 'patient_id', 'id')->latestOfMany('recorded_at');
    }
    
    /**
     * Jika kamu juga butuh gejala terbaru
     */
    public function latestSymptom(): HasOne
    {
        return $this->hasOne(SymptomLog::class, 'patient_id', 'id')->latestOfMany('recorded_at');
    }
}
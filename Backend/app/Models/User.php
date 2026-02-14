<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <--- 1. WAJIB TAMBAHKAN INI

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    // 2. TAMBAHKAN HasApiTokens di dalam baris use di bawah ini
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
    'name', 'email', 'password', 'role', 
    'no_rm', 'phone', 'gender', 'birth_date', 'is_active'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke profil Pasien
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * Relasi ke profil Perawat
     */
    public function nurse()
    {
        return $this->belongsTo(Nurse::class, 'nurse_id');
    }

    /**
     * Relasi ke semua data input gula darah
     */
    public function glucoseReadings()
    {
        return $this->hasMany(GlucoseReading::class, 'user_id');
    }

    /**
     * Relasi khusus untuk mengambil data TERBARU saja
     */
    public function latestGlucose()
    {
        // Kita hubungkan id di tabel users dengan patient_id di tabel blood_glucose_logs
        return $this->hasOne(BloodGlucoseLog::class, 'patient_id','id')->latestOfMany('id');
    }
}
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Bersihkan data lama agar tidak duplikat saat diron ulang
        // Hapus komentar baris di bawah ini jika ingin reset total setiap seeding
        // DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        // User::truncate();
        
        // 1. Buat Perawat Dummy
        // Menggunakan updateOrInsert agar tidak error jika data sudah ada
        $nurseId = DB::table('nurses')->insertGetId([
            'name' => 'Ns. Siti Aminah',
            'nip' => 'NIP-RSPG-001',
            'specialization' => 'Internal Medicine',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Buat Pasien Dummy
        $patientId = DB::table('patients')->insertGetId([
            'name' => 'Tn. Budi Santoso',
            'mrn' => 'RM-12345',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Buat Akun Login Perawat
        User::updateOrCreate(
            ['email' => 'nurse@rspg.com'], // Cek berdasarkan email
            [
                'name' => 'Ns. Siti Aminah', // Tambahkan name agar Dashboard tidak kosong
                'password' => Hash::make('password123'),
                'role' => 'nurse',
                'nurse_id' => $nurseId
            ]
        );

        // 4. Buat Akun Login Pasien
        User::updateOrCreate(
            ['email' => 'budi@gmail.com'], // Cek berdasarkan email
            [
                'name' => 'Tn. Budi Santoso',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'patient_id' => $patientId // Ini akan bernilai ID 1 (atau sesuai urutan DB)
            ]
        );

        $this->command->info('Seed data berhasil: budi@gmail.com & nurse@rspg.com siap digunakan!');
    }
}
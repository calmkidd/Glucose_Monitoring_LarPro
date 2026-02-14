<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NurseController extends Controller
{
    /**
     * Dashboard Summary
     * Menampilkan total pasien dan daftar ringkas untuk dashboard utama
     */
    public function getPatientsSummary()
    {
        try {
            // Kita gunakan Eager Loading agar query tetap efisien
            // Pastikan relasi 'latestGlucose' sudah ditambahkan di User.php
            $patients = User::where('role', 'patient')
                ->with(['latestGlucose']) 
                ->get();

            // Kita hitung statistik secara dinamis di sini
            $criticalCount = 0;
            $warningCount = 0;

            $mappedPatients = $patients->map(function($p) use (&$criticalCount, &$warningCount) {
                $latest = $p->latestGlucose;
                $glucoseVal = $latest ? $latest->value : null;

                // Logika Triage (Tanpa merubah struktur data lama)
                $severity = 'normal';
                if ($glucoseVal >= 200) {
                    $severity = 'critical';
                    $criticalCount++;
                } else if ($glucoseVal >= 140) {
                    $severity = 'warning';
                    $warningCount++;
                }

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'rm' => $p->no_rm ?? 'RM-'.$p->id,
                    'status' => $p->is_active ? 'Aktif' : 'Non-Aktif',
                    // recorded_at diformat agar manusiawi
                    'last_visit' => $latest && $latest->recorded_at 
                                    ? $latest->recorded_at->diffForHumans() 
                                    : '-',
                    'latest_glucose' => $glucoseVal, // Sekarang tidak NULL lagi
                    'severity' => $severity,         // Menambahkan info untuk warna tabel
                ];
            });

            return response()->json([
                'total' => $patients->count(),
                'critical' => $criticalCount, // Update angka real
                'warning' => $warningCount,   // Update angka real
                'patients' => $mappedPatients
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Simpan Pasien Baru
     * Digunakan oleh NurseAddPatient.jsx
     */
    public function storePatient(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'email' => 'required|email|unique:users',
                'no_rm' => 'required|string|unique:users',
                'phone' => 'nullable|string',
                'gender' => 'required|in:L,P',
                'birth_date' => 'required|date'
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'no_rm' => $validated['no_rm'],
                'phone' => $validated['phone'],
                'gender' => $validated['gender'],
                'birth_date' => $validated['birth_date'],
                'role' => 'patient',
                'is_active' => false, // Default non-aktif sampai aktivasi mandiri
                'password' => Hash::make('PENDING_ACTIVATION'), // Password sementara
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Pasien berhasil terdaftar di sistem RSPG',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List Pasien Lengkap
     * Digunakan untuk halaman tabel Database Pasien
     */
    public function listPatients()
    {
        try {
            $patients = User::where('role', 'patient')->orderBy('created_at', 'desc')->get();
            return response()->json($patients);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Log Aktivitas
     * Menampilkan timeline aktivitas pasien
     */
    public function getActivityLog()
    {
        // Sementara return array kosong agar tidak error di dashboard
        return response()->json([]);
    }
}
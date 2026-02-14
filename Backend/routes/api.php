<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RspgController;
use App\Http\Controllers\Api\HealthLogController;
use App\Http\Controllers\Api\NurseController; // Pastikan namespace benar

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- RUTE PUBLIK ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/activate', [AuthController::class, 'activate']);

// Chat AI (Taruh di sini jika ingin bisa diakses tanpa login, 
// atau pindahkan ke dalam middleware auth jika hanya untuk user terdaftar)
Route::post('/chat', [RspgController::class, 'chatAI']);


// --- RUTE TERPROTEKSI (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/auth/me', [AuthController::class, 'me']);

    // 1. Grouping Rute Pasien
    Route::prefix('patient')->group(function () {
        Route::post('/blood-glucose', [HealthLogController::class, 'storeGlucose']);
        Route::get('/blood-glucose', [HealthLogController::class, 'listGlucose']);
        
        Route::post('/medications', [HealthLogController::class, 'storeMedication']);
        Route::get('/medications', [HealthLogController::class, 'listMedications']);
        
        Route::post('/symptoms', [HealthLogController::class, 'storeSymptom']);
        Route::get('/symptoms', [HealthLogController::class, 'listSymptoms']);
        
        Route::get('/health-summary', [HealthLogController::class, 'getHealthSummary']);
    });

    // 2. Grouping Rute Perawat (Nurse)
    Route::prefix('nurse')->group(function () {
        // FITUR BARU: Registrasi Pasien oleh Perawat
        // Endpoint: POST /api/nurse/patients
        Route::post('/patients', [NurseController::class, 'storePatient']);
        
        // Melihat Daftar Semua Pasien (Tabel)
        // Endpoint: GET /api/nurse/patients
        Route::get('/patients', [NurseController::class, 'listPatients']);
        
        // Log Aktivitas & Summary
        Route::get('/activity-log', [NurseController::class, 'getActivityLog']);
        Route::get('/patients-summary', [NurseController::class, 'getPatientsSummary']);
    });
});
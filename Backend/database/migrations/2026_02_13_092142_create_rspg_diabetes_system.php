<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // 1. Tabel Detail Pasien
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('mrn')->unique(); // Rekam Medis
            $table->timestamps();
        });

        // 2. Tabel Detail Perawat
        Schema::create('nurses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('nip')->unique(); // Nomor Induk Pegawai
            $table->string('specialization')->default('Internal Medicine');
            $table->timestamps();
        });

        // 3. Log Gula Darah
        Schema::create('blood_glucose_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained();
            $table->integer('value');
            $table->timestamp('recorded_at')->useCurrent();
        });

        // 4. Log Gejala (Symptom)
        Schema::create('symptom_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained();
            $table->text('hypo_symptoms')->nullable();
            $table->text('hyper_symptoms')->nullable();
            $table->string('severity');
            $table->string('risk_label'); // Aman, Waspada, Bahaya
            $table->timestamps();
        });

        // 5. Log Obat-obatan (Medications)
        Schema::create('medication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained();
            $table->string('medication_name'); // Nama Obat
            $table->string('dosage');          // Dosis (misal: 500mg)
            $table->string('time_of_day');     // Waktu (Pagi/Siang/Malam)
            $table->timestamp('taken_at')->useCurrent(); // Waktu konsumsi
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('medication_logs');
        Schema::dropIfExists('symptom_logs');
        Schema::dropIfExists('blood_glucose_logs');
        Schema::dropIfExists('nurses');
        Schema::dropIfExists('patients');
    }
};
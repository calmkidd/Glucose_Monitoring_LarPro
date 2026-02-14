<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('symptom_logs', function (Blueprint $table) {
            // Gunakan ->nullable() agar tidak error jika ada data yang kosong
            if (!Schema::hasColumn('symptom_logs', 'hypo_symptoms')) {
                $table->text('hypo_symptoms')->nullable();
            }
            if (!Schema::hasColumn('symptom_logs', 'hyper_symptoms')) {
                $table->text('hyper_symptoms')->nullable();
            }
            if (!Schema::hasColumn('symptom_logs', 'conditions')) {
                $table->string('conditions')->nullable();
            }
            if (!Schema::hasColumn('symptom_logs', 'note')) {
                $table->text('note')->nullable();
            }
            if (!Schema::hasColumn('symptom_logs', 'recorded_at')) {
                $table->timestamp('recorded_at')->nullable();
            }
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('symptom_logs', function (Blueprint $table) {
            //
        });
    }
};

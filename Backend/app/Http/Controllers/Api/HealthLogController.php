<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BloodGlucoseLog;
use App\Models\MedicationLog;
use App\Models\SymptomLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class HealthLogController extends Controller
{
    /**
     * DASHBOARD PERAWAT (MONITORING)
     * Menampilkan data live dari semua pasien untuk Nurse Dashboard
     */
    public function getPatientsSummary() {
        try {
            $patients = User::where('role', 'patient')->get();
            $total = $patients->count();
            $critical = 0; 
            $warning = 0; 
            $list = [];

            foreach ($patients as $p) {
                // Mencari log berdasarkan ID User utama
                $latest = BloodGlucoseLog::where('patient_id', $p->id)
                            ->orderBy('recorded_at', 'desc')
                            ->first();
                
                $val = $latest ? (int)$latest->value : null;
                
                $status = 'Stabil';
                $severity = 'normal';
                
                if ($val >= 200) { 
                    $status = 'Bahaya'; 
                    $severity = 'critical'; 
                    $critical++; 
                } elseif ($val >= 140 || ($val < 70 && $val > 0)) { 
                    $status = 'Waspada'; 
                    $severity = 'warning'; 
                    $warning++; 
                }

                $list[] = [
                    'id' => $p->id,
                    'name' => $p->name ?? 'Pasien',
                    'rm' => $p->no_rm ?? 'RSPG-' . str_pad($p->id, 3, '0', STR_PAD_LEFT),
                    'latest_glucose' => $val ?? '--',
                    'severity' => $severity,
                    'status' => $status,
                    'last_update' => $latest ? Carbon::parse($latest->recorded_at)->diffForHumans() : 'No data'
                ];
            }

            return response()->json([
                'total' => $total, 
                'critical' => $critical, 
                'warning' => $warning, 
                'patients' => $list
            ]);
        } catch (\Exception $e) { 
            return response()->json(['error' => $e->getMessage()], 500); 
        }
    }

    /**
     * GULA DARAH (LIST & STORE)
     */
    public function listGlucose(Request $request) {
        // Fix: Gunakan ID orang yang login jika query param tidak valid
        $pid = Auth::id() ?: $request->query('patient_id');
        return response()->json(
            BloodGlucoseLog::where('patient_id', $pid)
                ->orderBy('recorded_at', 'desc')
                ->get()
        );
    }

    public function storeGlucose(Request $request) {
        $request->validate(['value' => 'required|numeric']);
        BloodGlucoseLog::create([
            'patient_id' => Auth::id(), 
            'value' => $request->value, 
            'recorded_at' => now()
        ]);
        return response()->json(['status' => 'ok']);
    }

    /**
     * OBAT (LIST & STORE)
     */
    public function listMedications(Request $request) {
        $pid = Auth::id() ?: $request->query('patient_id');
        return response()->json(
            MedicationLog::where('patient_id', $pid)
                ->orderBy('recorded_at', 'desc')
                ->get()
        );
    }

    public function storeMedication(Request $request) {
        MedicationLog::create([
            'patient_id' => Auth::id(),
            'medication_name' => $request->medication_name,
            'dosage' => $request->dosage ?? '-',
            'time_of_day' => $request->time_of_day ?? 'Pagi',
            'recorded_at' => now()
        ]);
        return response()->json(['status' => 'ok']);
    }

    /**
     * GEJALA / ASSESSMENT (LIST & STORE)
     */
    public function listSymptoms(Request $request) {
        $pid = Auth::id() ?: $request->query('patient_id');
        return response()->json(
            SymptomLog::where('patient_id', $pid)
                ->orderBy('recorded_at', 'desc')
                ->get()
        );
    }

    public function storeSymptom(Request $request) {
        try {
            $log = SymptomLog::create([
                'patient_id'     => Auth::id(),
                'hypo_symptoms'  => $request->hypo_symptoms ?? '',
                'hyper_symptoms' => $request->hyper_symptoms ?? '',
                'severity'       => $request->severity,
                'risk_label'     => $request->severity ?? 'Sedang',
                'conditions'     => $request->conditions ?? 'Stabil',
                'note'           => $request->note ?? '-',
                'recorded_at'    => now(),
            ]);
            return response()->json(['status' => 'ok', 'data' => $log]);
        } catch (\Exception $e) { 
            return response()->json(['error' => $e->getMessage()], 500); 
        }
    }

    /**
     * RINGKASAN KESEHATAN (Untuk Dashboard Pasien)
     */
    public function getHealthSummary(Request $request) {
        $pid = Auth::id() ?: $request->query('patient_id');
        
        $latest = BloodGlucoseLog::where('patient_id', $pid)
                    ->orderBy('recorded_at', 'desc')
                    ->first();
        
        $score = 0; $level = "No data"; $recommendations = [];

        if ($latest) {
            $v = (int)$latest->value;
            if ($v > 200) { 
                $score = 45; $level = "Buruk"; 
                $recommendations = ["Kontak dokter segera", "Kurangi karbohidrat berlebih"]; 
            } elseif ($v > 140) {
                $score = 75; $level = "Waspada";
                $recommendations = ["Perbanyak aktivitas fisik", "Pantau konsumsi gula"];
            } else { 
                $score = 95; $level = "Bagus"; 
                $recommendations = ["Pertahankan pola makan dan olahraga"]; 
            }
        }
        
        return response()->json([
            'score' => $score, 
            'level' => $level, 
            'recommendations' => $recommendations
        ]);
    }
}
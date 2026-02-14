<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RspgController extends Controller
{
    public function chatAI(Request $request)
    {
        try {
            $userMessage = $request->input('message');
            $status = $request->input('context.status', 'Stabil');
            $glucose = $request->input('context.glucose', '-');

            if (!$userMessage) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pesan tidak boleh kosong.'
                ], 400);
            }

            // Prompt profesional untuk asisten medis digital
            $prompt = "
            IDENTITAS: Anda adalah Asisten Medis Digital Rumah Sakit Petrokimia Gresik (RSPG).
            KONTEKS PASIEN: Gula darah terakhir {$glucose} mg/dL dengan status kesehatan {$status}.
            
            INSTRUKSI:
            1. Jawab pertanyaan berikut dengan ramah dan santun: '{$userMessage}'
            2. Gunakan bahasa Indonesia yang mudah dipahami.
            3. Berikan saran pola makan atau gaya hidup ringan sesuai angka gula darah tersebut.
            4. PENTING: Jika gula darah > 250 mg/dL atau < 70 mg/dL, sarankan pasien segera ke IGD atau hubungi dokter.
            5. JANGAN memberikan dosis obat spesifik.
            ";

            // Menggunakan Gemini 2.0 Flash (v1beta tetap digunakan untuk fitur terbaru)
            $model = "gemini-2.5-flash";
            $apiKey = config('services.gemini.key');

            $response = Http::withOptions([
                    'verify' => false, // Bypass SSL di localhost
                ])
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                    "contents" => [
                        [
                            "parts" => [
                                ["text" => $prompt]
                            ]
                        ]
                    ]
                ]);

            if (!$response->successful()) {
                Log::error("Gemini API Error: " . $response->body());
                
                return response()->json([
                    'success' => false,
                    'message' => 'Sistem AI sedang dalam pemeliharaan.',
                    'status_code' => $response->status()
                ], 500);
            }

            $data = $response->json();
            
            // Mengambil reply dari struktur JSON Gemini
            $aiReply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, saya tidak dapat memproses jawaban saat ini.';

            return response()->json([
                'success' => true,
                'reply' => $aiReply
            ]);

        } catch (\Exception $e) {
            Log::error("ChatController Error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem internal.'
            ], 500);
        }
    }
}
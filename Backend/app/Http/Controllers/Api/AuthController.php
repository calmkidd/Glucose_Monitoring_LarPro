<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // Register (Umum)
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:patient,nurse'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true, // Register mandiri langsung aktif
            'patient_id' => $request->role === 'patient' ? 'P' . time() : null
        ]);

        return response()->json(['message' => 'User created'], 201);
    }

    // Aktivasi Akun Pasien (Baru ditambahkan)
    public function activate(Request $request) {
        $request->validate([
            'no_rm' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed', // Perlu password_confirmation di frontend
        ]);

        $user = User::where('no_rm', $request->no_rm)
                    ->where('email', $request->email)
                    ->where('role', 'patient')
                    ->first();

        if (!$user) {
            return response()->json(['message' => 'Data pasien tidak ditemukan. Periksa kembali No. RM dan Email.'], 404);
        }

        if ($user->is_active) {
            return response()->json(['message' => 'Akun ini sudah aktif.'], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Akun berhasil diaktifkan! Silakan login.']);
    }

    // Login
    public function login(Request $request) {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Cek kredensial
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json(['message' => 'Login gagal, email atau password salah'], 401);
            }

            $user = Auth::user();

            // Proteksi: Jika user belum aktif, jangan berikan token
            if (!$user->is_active) {
                Auth::logout(); // Putuskan session yang baru dibuat attempt
                return response()->json(['message' => 'Akun Anda belum aktif. Silakan lakukan aktivasi terlebih dahulu.'], 403);
            }
            
            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'no_rm' => $user->no_rm,
                    'patient_id' => $user->patient_id,
                    'nurse_id' => $user->nurse_id
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Login Error: " . $e->getMessage());
            return response()->json(['error' => 'Gagal login: ' . $e->getMessage()], 500);
        }
    }

    // Profil Me
    public function me(Request $request) {
        $user = $request->user(); 

        if (!$user) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'no_rm' => $user->no_rm,
            'patient_id' => $user->patient_id,
            'nurse_id' => $user->nurse_id
        ]);
    }
}
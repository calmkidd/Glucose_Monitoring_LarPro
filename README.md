# 🏥 RSPG Glucose Monitoring Prototype

Prototype Sistem Monitoring Gula Darah Real-time untuk Rumah Sakit Paru Gunawan (RSPG). Aplikasi ini menghubungkan pasien dan perawat dalam satu ekosistem digital untuk pemantauan kadar glukosa darah secara mandiri.

---

## 🚀 Fitur Utama

### 👨‍⚕️ Dashboard Monitoring Perawat (Clinical Command Center)
- **Triage Otomatis**: Klasifikasi otomatis status pasien menjadi **Bahaya (Critical)**, **Waspada (Warning)**, dan **Stabil** berdasarkan input terbaru.
- **Auto-Sync**: Data tersinkronisasi otomatis setiap 5 detik tanpa perlu refresh halaman.
- **Manajemen Pasien**: Pendaftaran pasien baru dan pemberian Nomor Rekam Medis (RM).
- **UI Premium**: Tampilan tabel yang bersih dengan indikator warna status kesehatan.

### 👤 Dashboard Pasien (Self-Monitoring)
- **Log Gula Darah**: Input kadar gula darah mandiri dengan pencatatan waktu otomatis.
- **Ringkasan Kesehatan**: Skor kesehatan dinamis dan rekomendasi tindakan berdasarkan kadar gula terbaru.
- **Log Obat & Gejala**: Pencatatan konsumsi obat dan gejala harian untuk riwayat medis yang lengkap.

---

## 🛠️ Stack Teknologi

- **Backend**: [Laravel 11](https://laravel.com) (PHP 8.2+) dengan Laravel Sanctum untuk Autentikasi API.
- **Frontend**: [React.js](https://reactjs.org) dengan Vite & Tailwind CSS.
- **Database**: MySQL / MariaDB.
- **State Management**: React Hooks (useEffect, useState).
- **GEMINI AI**: Gemini 2.5 Flash Gunakan API yang didapat dari `http://aistudio.google.com/`

---

## 📦 Cara Instalasi

### 1. Persiapan Backend (Laravel)
```bash
# Masuk ke folder backend
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```
--------
Sistem ini mengimplementasikan keamanan tingkat API menggunakan:
- Sanctum Authentication: Setiap request dilindungi oleh Token Bearer.
- Auth Guarding: Pasien hanya dapat melihat dan menginput data miliknya sendiri melalui identifikasi auth()->id() di sisi server, mencegah kebocoran data antar pengguna.
Dikembangkan dengan untuk kemajuan sistem monitoring kesehatan digital.

------------------------
Maintained by: @calmkidd
------------------------

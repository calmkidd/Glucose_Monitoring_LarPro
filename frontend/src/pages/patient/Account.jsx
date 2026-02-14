import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/account.css";

export default function Account() {
  const { logout } = useAuth();
  const [showRM, setShowRM] = useState(false);

  // Inisialisasi data profil (Nantinya bisa diintegrasikan dengan API /auth/me)
  const [profile, setProfile] = useState({
    fullName: "Budi Santoso",
    noRM: "RSPG-2026-0881",
    email: "budi.santoso@email.com",
    phone: "0812-3456-7890",
    address: "Jl. Veteran No. 1, Gresik",
    bloodType: "O+",
    weight: "72 kg",
    height: "175 cm"
  });

  // Safety check: Jika data profile belum siap, tampilkan loading agar tidak putih polos
  if (!profile) return <div className="loading-state">Memuat Profil...</div>;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        setProfile({
          fullName: data.display_name,
          noRM: data.mrn || "N/A",
          email: data.email,
          phone: "-", // Tambahkan field di DB jika perlu
          address: "-",
          bloodType: "-",
          weight: "-",
          height: "-"
        });
      } catch (err) {
        console.error("Gagal ambil profil:", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="account-container">
      <header className="account-header">
        <h1>Profil & Keamanan</h1>
        <p>Kelola informasi identitas dan pengaturan keamanan akun Anda.</p>
      </header>

      <div className="account-grid">
        {/* KOLOM KIRI: IDENTITY CARD */}
        <div className="account-column identity-card">
          <div className="profile-image-wrapper">
            <div className="profile-image">
              {/* Gunakan optional chaining agar tidak error jika fullName kosong */}
              {profile.fullName?.charAt(0) || "P"}
            </div>
            <div className="status-badge">Pasien Aktif</div>
          </div>
          <div className="identity-info">
            <h2>{profile.fullName}</h2>
            <div className="rm-box">
              <label>No. Rekam Medis</label>
              <div className="rm-value">
                <span>{showRM ? profile.noRM : "••••••••••••"}</span>
                <button onClick={() => setShowRM(!showRM)} className="btn-view">
                  {showRM ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM TENGAH: PERSONAL DETAILS */}
        <div className="account-column personal-details">
          <h3>Informasi Personal</h3>
          <div className="form-premium">
            <div className="input-group-account">
              <label>Email Address</label>
              <input type="email" value={profile.email} readOnly />
            </div>
            <div className="input-group-account">
              <label>Nomor Telepon</label>
              <input 
                type="text" 
                value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})} 
              />
            </div>
            <div className="input-group-account">
              <label>Alamat Domisili</label>
              <textarea 
                value={profile.address} 
                rows="3" 
                onChange={(e) => setProfile({...profile, address: e.target.value})}
              />
            </div>
            <div className="medical-mini-grid">
              <div className="mini-box">
                <label>Gol. Darah</label>
                <span>{profile.bloodType}</span>
              </div>
              <div className="mini-box">
                <label>Berat</label>
                <span>{profile.weight}</span>
              </div>
              <div className="mini-box">
                <label>Tinggi</label>
                <span>{profile.height}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: SECURITY & LOGOUT */}
        <div className="account-column security-hub">
          <h3>Keamanan Akun</h3>
          <div className="security-card">
            <div className="security-item">
              <div className="sec-icon">🔒</div>
              <div className="sec-text">
                <strong>Kata Sandi</strong>
                <p>Terakhir diubah 3 bulan lalu</p>
              </div>
              <button className="btn-outline-small">Ubah</button>
            </div>
            <div className="security-item">
              <div className="sec-icon">📱</div>
              <div className="sec-text">
                <strong>Notifikasi WA</strong>
                <p>Pengingat obat aktif</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="logout-section">
            <button className="btn-logout-premium" onClick={logout}>
              Keluar dari Sistem
            </button>
            <p className="version-tag">RSPG Portal v2.0.1 (Enterprise)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
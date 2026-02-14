import React, { useEffect, useState } from "react";
import { getProfile } from "../../api";
import "../../styles/nurse.css";

export default function NurseProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        // Memastikan data yang masuk sesuai dengan struktur user Laravel
        setUser(data);
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return (
    <div className="nurse-container">
      <div className="pulse-loader">Mengambil data kredensial...</div>
    </div>
  );

  // Jika gagal ambil data, tampilkan pesan error atau arahkan login ulang
  if (!user) return <div className="nurse-container">Sesi berakhir. Silakan login kembali.</div>;

  return (
    <div className="nurse-profile-wrapper">
      <div className="premium-header">
        <h1 style={{ color: '#1e293b' }}>Profil Petugas Medis</h1>
        <p style={{ color: '#64748b' }}>Informasi kredensial dan akses sistem pemantauan real-time.</p>
      </div>

      <div className="profile-grid">
        {/* KARTU UTAMA: IDENTITAS */}
        <div className="profile-card identity-highlight">
          <div className="avatar-container">
            <span className="avatar-icon">🩺</span>
            <div className="status-indicator">Online</div>
          </div>
          <div className="identity-text">
            <label style={{ color: '#64748b' }}>Nama Lengkap</label>
            {/* Menggunakan user.name (standar Laravel) atau user.display_name */}
            <h2 style={{ color: '#1e293b', fontWeight: '800' }}>
               {user.name || user.display_name || "Petugas Medis"}
            </h2>
            <span className="badge-nurse">
              {user.role ? user.role.toUpperCase() : "NURSE"}
            </span>
          </div>
        </div>

        {/* KARTU DETAIL: DATA PEGAWAI */}
        <div className="profile-card info-details">
          <h3 style={{ color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            Detail Kepegawaian
          </h3>
          <div className="detail-item">
            <label>Email Akses</label>
            <p style={{ color: '#1e293b', fontWeight: '600' }}>{user.email}</p>
          </div>
          <div className="detail-item">
            <label>Nomor Induk Pegawai (NIP)</label>
            {/* Menggunakan user.nip sesuai database atau fallback */}
            <p style={{ color: '#1e293b', fontWeight: '600' }}>
              {user.nip || user?.id_karyawan || "PGM-001"}
            </p>
          </div>
          <div className="detail-item">
            <label>Unit Departemen</label>
            <p style={{ color: '#1e293b' }}>Diabetes Center - RS Petrokimia Gresik</p>
          </div>
          <div className="detail-item">
            <label>Spesialisasi Akses</label>
            <p style={{ color: '#1e293b' }}>Internal Medicine Monitoring</p>
          </div>
        </div>

        {/* KARTU KEAMANAN & SISTEM */}
        <div className="profile-card security-box">
          <h3 style={{ color: '#1e293b' }}>Keamanan & Sistem</h3>
          <div className="security-status">
            <div className="status-item">
              <span className="icon">🔒</span>
              <div>
                <strong style={{ color: '#1e293b' }}>Enkripsi Sesi</strong>
                <p>HS256 - Aktif</p>
              </div>
            </div>
            <div className="status-item">
              <span className="icon">🛡️</span>
              <div>
                <strong style={{ color: '#1e293b' }}>Izin Akses</strong>
                <p>Level: {user.role === 'nurse' ? 'Administrator Medis' : 'Petugas'}</p>
              </div>
            </div>
          </div>
          <button className="btn-edit-premium">Ubah Kata Sandi</button>
        </div>
      </div>
    </div>
  );
}
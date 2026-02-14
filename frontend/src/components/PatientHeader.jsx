import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function PatientHeader() {
  const { user } = useAuth(); // Pastikan data user diambil dari context

  return (
    <header className="main-header-premium">
      <div className="header-left">
        {/* Pastikan class ini ada di CSS Anda agar teks muncul */}
        <span className="system-title-txt">SISTEM INFORMASI PANTAU GULA DARAH SEHAT</span>
      </div>
      <div className="header-right">
        <div className="patient-profile-info">
          <div className="user-info-text">
            <span className="label-patient">Selamat Datang,</span>
            {/* Mengambil nama akun yang login secara dinamis */}
            <span className="patient-name-header">{user?.display_name || user?.name || "Pasien"}</span>
          </div>
          <div className="user-avatar-circle">
            {(user?.display_name || user?.name || "P").charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/Logo_pgm.png"; 
import "../styles/nurse.css";

export default function NurseLayout() {
  const location = useLocation();

  const menuItems = [
    { path: "/nurse", label: "Command Center", icon: "📊" },
    { path: "/nurse/add-patient", label: "Registrasi Pasien", icon: "➕" }, // MENU BARU
    { path: "/nurse/patients", label: "Daftar Pasien", icon: "👥" },
    { path: "/nurse/activity", label: "Log Aktivitas", icon: "📝" },
    { path: "/nurse/triage-reports", label: "Laporan Triage", icon: "📋" },
    { path: "/nurse/profile", label: "Akun Saya", icon: "👤" },
  ];

  return (
    <div className="nurse-layout-wrapper">
      <aside className="nurse-sidebar-premium">
        {/* LOGO DI POJOK KIRI ATAS SIDEBAR */}
        <div className="sidebar-brand-nurse">
          <img src={logo} alt="RSPG Logo" className="nurse-logo-img" />
          <div className="brand-text">
            <strong>Nurse Portal</strong>
            <span>RS Petrokimia Gresik</span>
          </div>
        </div>
        
        <nav className="nurse-nav-menu">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer-nurse">
          <button className="btn-logout-nurse" onClick={() => window.location.href='/login'}>
            Keluar Sistem
          </button>
        </div>
      </aside>

      <main className="nurse-content-area">
        {/* Header content area yang diperbarui */}
        <header className="content-top-bar">
          <div className="top-bar-left">
            <span className="system-subtitle">Sistem Informasi Pantau Gula Darah Sehat</span>
          </div>
          <div className="top-bar-right">
            <span className="medics-info">Petugas Medis: <strong>Ns. Siti (Internal Medicine)</strong></span>
          </div>
        </header>
        
        <div className="content-padding">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
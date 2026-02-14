import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function PatientSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <img src="/Logo_pgm.png" alt="Logo" className="sidebar-logo" />
        <div className="brand-text">
          <h3 className="portal-name">Portal Pasien</h3>
          <p className="hospital-name">RS PETROKIMIA GRESIK</p>
        </div>
      </div>

      {/* Gunakan class 'sidebar-menu' agar menu tersusun ke bawah */}
      <nav className="sidebar-menu">
        <NavLink to="/patient/dashboard" className="menu-item">
          <span className="icon"></span> 
          <span className="menu-text">Dashboard</span>
        </NavLink>
        <NavLink to="/patient/glucose" className="menu-item">
          <span className="icon"></span> 
          <span className="menu-text">Gula Darah</span>
        </NavLink>
        <NavLink to="/patient/meds" className="menu-item">
          <span className="icon"></span> 
          <span className="menu-text">Obat-obatan</span>
        </NavLink>
        <NavLink to="/patient/symptoms" className="menu-item">
          <span className="icon"></span> 
          <span className="menu-text">Keluhan Riwayat</span>
        </NavLink>
        <NavLink to="/patient/education" className="menu-item">
          <span className="icon"></span> 
          <span className="menu-text">Edukasi Sehat</span>
        </NavLink>
        <NavLink to="/patient/account" className="menu-item">
          <span className="icon"></span> 
          <span className="menu-text">Akun Saya</span>
        </NavLink>
      </nav>

          <div className="sidebar-footer-premium">
      <button className="btn-logout-sidebar-centered" onClick={logout}>
        Logout
      </button>
    </div>
    </aside>
  );
}
import { useState, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom"; 
import logo from "../assets/Logo_pgm.png";
import hero from "../assets/login-illustration.png";
import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const sectionRefs = {
    home: useRef(null),
    edu: useRef(null),
    guide: useRef(null),
    contact: useRef(null)
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result) {
      // Logic redirect berdasarkan role
      const userRole = localStorage.getItem("role");
      userRole === "nurse" ? navigate("/nurse") : navigate("/patient/dashboard");
    } else {
      setError("Email atau password salah");
    }
  };

  return (
    <div className="landing-wrapper">
      <nav className="main-nav">
        <div className="container nav-flex">
          <img src={logo} className="nav-logo" alt="RSPG" />
          <div className="nav-menu">
            <span onClick={() => scrollToSection(sectionRefs.home)}>Home</span>
            <span onClick={() => scrollToSection(sectionRefs.edu)}>Edukasi</span>
            <span onClick={() => scrollToSection(sectionRefs.guide)}>Panduan</span>
            <span onClick={() => scrollToSection(sectionRefs.contact)}>Kontak</span>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO & LOGIN */}
      <section className="section-hero" ref={sectionRefs.home}>
        <div className="container hero-flex">
          <div className="hero-info">
            <span className="pill-small">Smart Health Monitoring</span>
            <h1>Sistem Monitoring <br/><span className="text-primary">Gula Darah Digital</span></h1>
            <p className="hero-desc">Layanan kesehatan paripurna RS Petrokimia Gresik yang memudahkan Anda memantau kadar glukosa harian secara akurat.</p>
            <div className="hero-actions">
              {/* Tombol ini juga diarahkan ke halaman Aktivasi */}
              <button className="btn-hero-primary" onClick={() => navigate("/activate")}>Aktivasi Pasien</button>
              <button className="btn-hero-outline" onClick={() => scrollToSection(sectionRefs.guide)}>Lihat Panduan</button>
            </div>
            <img src={hero} className="hero-img-refined" alt="Healthcare" />
          </div>

          <div className="login-side">
            <form className="login-card-premium" onSubmit={submit}>
              <div className="card-header">
                <h2>Masuk Portal</h2>
                <p>Silakan akses portal monitoring Anda</p>
              </div>
              
              {error && <div className="error-msg">{error}</div>}
              
              <div className="input-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@example.com" 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <button type="submit" className="btn-main-login">Konfirmasi Akses</button>
              
              <div className="card-footer">
                {/* Integrasi Navigasi ke Halaman Aktivasi */}
                <span 
                  onClick={() => navigate("/activate")} 
                  style={{ cursor: "pointer", color: "var(--primary-color)", fontWeight: "600" }}
                >
                  Belum aktivasi? Klik di sini
                </span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 2: EDUKASI */}
      <section className="section-content" ref={sectionRefs.edu}>
        <div className="container">
          <div className="section-head-center">
            <span className="pill">Pusat Edukasi</span>
            <h2>Wawasan Medis Pasien</h2>
          </div>
          <div className="grid-edu">
            <div className="edu-card">
              <div className="edu-icon">🥗</div>
              <h3>Diet Nutrisi</h3>
              <p>Fokus pada karbohidrat kompleks dan serat untuk mencegah lonjakan insulin mendadak.</p>
            </div>
            <div className="edu-card">
              <div className="edu-icon">🏃</div>
              <h3>Kontrol Gerak</h3>
              <p>Olahraga aerobik ringan secara rutin membantu metabolisme glukosa lebih optimal.</p>
            </div>
            <div className="edu-card">
              <div className="edu-icon">🚨</div>
              <h3>Gejala Kritis</h3>
              <p>Waspadai rasa haus berlebih atau keringat dingin sebagai sinyal kondisi gula darah tidak stabil.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PANDUAN */}
      <section className="section-guide-bg" ref={sectionRefs.guide}>
        <div className="container">
          <div className="section-head-center">
            <span className="pill">Panduan Penggunaan</span>
            <h2>Alur Monitoring Digital</h2>
          </div>
          <div className="guide-steps">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-body">
                <h4>Cek Mandiri</h4>
                <p>Lakukan pengukuran gula darah menggunakan alat glukometer sesuai jadwal dokter.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-body">
                <h4>Input Data</h4>
                <p>Masuk ke dashboard dan masukkan angka hasil pemeriksaan pada menu Gula Darah.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-body">
                <h4>Analisis AI</h4>
                <p>Sistem AI akan memberikan ringkasan status kesehatan dan rekomendasi tindakan awal.</p>
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-body">
                <h4>Konsultasi</h4>
                <p>Data Anda otomatis terkirim ke tim perawat untuk pemantauan medis lebih lanjut.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: KONTAK */}
      <footer className="footer-premium" ref={sectionRefs.contact}>
        <div className="container footer-grid">
          <div className="footer-col">
            <h3>RS Petrokimia Gresik</h3>
            <p>Memberikan solusi kesehatan berbasis teknologi untuk masyarakat Gresik dan sekitarnya.</p>
          </div>
          <div className="footer-col">
            <p><strong>Lokasi:</strong> Jl. Jend. Ahmad Yani No.69, Gresik</p>
            <p><strong>Email:</strong> help@rspetrokimiagresik.com</p>
          </div>
          <div className="footer-col emergency-side">
            <h4>Bantuan Darurat:</h4>
            <div className="phone-box-clean">(031) 99100118</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
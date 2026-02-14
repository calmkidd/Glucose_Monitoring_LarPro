import { useState } from "react";
import axios from "axios";
import "../../styles/nurse.css";

export default function NurseAddPatient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    no_rm: "",
    phone: "",
    gender: "", // Tambahan: Jenis Kelamin
    birth_date: "" // Tambahan: Tanggal Lahir
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await axios.post(
        "http://localhost:8000/api/nurse/patients", 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      setStatus({ 
        type: "success", 
        message: `Berhasil! Pasien ${formData.name} telah didaftarkan dengan No. RM: ${formData.no_rm}` 
      });
      
      // Reset Form
      setFormData({ name: "", email: "", no_rm: "", phone: "", gender: "", birth_date: "" });
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal mendaftarkan pasien. Cek koneksi server atau duplikasi No. RM.";
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nurse-content-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Registrasi Pasien Baru</h2>
          <p className="page-subtitle">Pastikan data sesuai dengan dokumen identitas resmi (KTP/KK)</p>
        </div>
        <div className="header-badge">Input Medis</div>
      </div>

      <div className="registration-grid">
        <div className="form-column">
          <form onSubmit={handleSubmit} className="premium-form-card">
            {status.message && (
              <div className={`form-alert ${status.type === "error" ? "alert-danger" : "alert-success"}`}>
                <span className="alert-icon">{status.type === "error" ? "⚠️" : "✅"}</span>
                {status.message}
              </div>
            )}

            <div className="form-section">
              <h3 className="section-label">Identitas Dasar</h3>
              <div className="input-row">
                <div className="input-field">
                  <label>Nama Lengkap</label>
                  <input 
                    name="name"
                    type="text" 
                    placeholder="Nama sesuai KTP"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="input-field">
                  <label>No. Rekam Medis</label>
                  <input 
                    name="no_rm"
                    type="text" 
                    placeholder="RSPG-00000"
                    value={formData.no_rm}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-field">
                  <label>Tanggal Lahir</label>
                  <input 
                    name="birth_date"
                    type="date" 
                    value={formData.birth_date}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="input-field">
                  <label>Jenis Kelamin</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-label">Kontak & Akses</h3>
              <div className="input-row">
                <div className="input-field">
                  <label>Email (Untuk Login)</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="pasien@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="input-field">
                  <label>No. WhatsApp</label>
                  <input 
                    name="phone"
                    type="tel" 
                    placeholder="08xxxxxxxx"
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setFormData({ name: "", email: "", no_rm: "", phone: "", gender: "", birth_date: "" })}>
                Reset
              </button>
              <button type="submit" className="btn-submit-nurse" disabled={loading}>
                {loading ? "Memproses..." : "Daftarkan & Kirim Aktivasi"}
              </button>
            </div>
          </form>
        </div>

        {/* SIDEBAR PREVIEW */}
        <div className="preview-column">
          <div className="preview-card">
            <h4>Ringkasan Input</h4>
            <div className="preview-item">
              <small>Nama</small>
              <p>{formData.name || "-"}</p>
            </div>
            <div className="preview-item">
              <small>No. RM</small>
              <p className="rm-highlight">{formData.no_rm || "Belum diisi"}</p>
            </div>
            <div className="preview-item">
              <small>Email</small>
              <p>{formData.email || "-"}</p>
            </div>
            <div className="info-box-activation">
              <p>ℹ️ Pasien akan menerima status <strong>Non-Aktif</strong> sampai mereka melakukan aktivasi mandiri di halaman login.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
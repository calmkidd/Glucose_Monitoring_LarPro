import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css"; // Gunakan CSS login yang sudah ada

export default function ActivateAccount() {
  const [formData, setFormData] = useState({
    no_rm: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleActivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:8000/api/auth/activate", formData);
      setMessage({ type: "success", text: response.data.message + " Mengalihkan ke Login..." });
      
      // Tunggu 3 detik lalu pindah ke login
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Gagal aktivasi. Pastikan No. RM dan Email benar." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-premium">
        <div className="auth-header">
          <h2>Aktivasi Akun Pasien</h2>
          <p>Masukkan detail yang diberikan oleh Perawat RSPG</p>
        </div>

        {message.text && (
          <div className={`auth-alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleActivate} className="auth-form">
          <div className="input-group">
            <label>Nomor Rekam Medis (No. RM)</label>
            <input 
              type="text" placeholder="Contoh: RSPG-001" 
              value={formData.no_rm}
              onChange={e => setFormData({...formData, no_rm: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <label>Email Terdaftar</label>
            <input 
              type="email" placeholder="nama@email.com" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>

          <div className="input-row-flex">
            <div className="input-group">
              <label>Buat Password Baru</label>
              <input 
                type="password" placeholder="******" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>
            <div className="input-group">
              <label>Konfirmasi Password</label>
              <input 
                type="password" placeholder="******" 
                value={formData.password_confirmation}
                onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? "Memproses..." : "Aktifkan Akun Saya"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Sudah aktif? <Link to="/login">Masuk di sini</Link></p>
        </div>
      </div>
    </div>
  );
}
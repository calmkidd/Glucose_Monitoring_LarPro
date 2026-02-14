import { useEffect, useState } from "react";
import { getPatients } from "../../api";
import "../../styles/nurse.css";

export default function NurseDashboard() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const data = await getPatients();
      if (data && data.patients) {
        setPatients(data.patients);
        setStats({ 
          total: data.total || 0, 
          critical: data.critical || 0, 
          warning: data.warning || 0 
        });
        setError(null);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data:", err);
      setError("Server tidak merespon. Pastikan Backend API menyala.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    loadData(); 
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="nurse-container">
      <div className="pulse-loader">Menginisialisasi Command Center...</div>
    </div>
  );

  return (
    <div className="nurse-container">
      {/* HEADER DENGAN LIVE INDICATOR */}
      <header className="nurse-header">
        <div className="header-title">
          <h1 style={{ color: '#1e293b', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Clinical Command Center
          </h1>
          <p style={{ color: '#64748b' }}>Pemantauan Pasien Real-time • RS Petrokimia Gresik</p>
        </div>
        <div className="live-indicator">
          <span className="dot"></span> LIVE MONITORING
        </div>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <label>Total Pasien</label>
          <div className="stat-val">{stats.total}</div>
        </div>
        <div className="stat-card critical">
          <label>Kondisi Bahaya</label>
          <div className="stat-val">{stats.critical}</div>
          <div className="stat-desc">Perlu Tindakan Segera</div>
        </div>
        <div className="stat-card warning">
          <label>Kondisi Waspada</label>
          <div className="stat-val">{stats.warning}</div>
          <div className="stat-desc">Monitor Lebih Sering</div>
        </div>
      </div>

      {/* MONITORING TABLE */}
      <div className="monitor-section">
        <table className="nurse-table">
          <thead>
            <tr>
              <th>INFORMASI PASIEN</th>
              <th>KADAR GULA DARAH</th>
              <th>STATUS TRIAGE</th>
              <th>UPDATE TERAKHIR</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? patients.map((p) => (
              <tr key={p.id} className={p.severity}>
                <td className="patient-cell">
                    {/* BAGIAN YANG DIRAPIKAN: Nama & RM */}
                    <div className="name-wrapper">
                      <div className="patient-main-info">
                        <strong className="patient-name-text">{p.name}</strong>
                        <span className="rm-separator">/</span>
                        <span className="rm-badge-elegant">
                          ID: {p.rm || 'N/A'}
                        </span>
                      </div>
                      <small className="patient-sub-status">
                        Status: {p.status || 'Aktif'}
                      </small>
                    </div>
                </td>
                <td className="glucose-td">
                  <div className="glucose-flex-container">
                      <span className="glucose-value-text">
                          {p.latest_glucose || '--'}
                      </span> 
                      <span className="unit-text">mg/dL</span>
                  </div>
              </td>
                <td>
                    <div className="badge-wrapper">
                      <span className={`triage-badge ${p.severity || 'stable'}`}>
                          {p.severity === 'critical' ? 'BAHAYA' : 
                           p.severity === 'warning' ? 'WASPADA' : 'STABIL'}
                      </span>
                    </div>
                </td>
                <td className="time-cell">
                    <span className="time-text">{p.last_visit}</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="empty-state">
                  Menunggu data pasien dari database...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
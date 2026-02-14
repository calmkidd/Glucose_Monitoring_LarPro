import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { addBloodGlucose, getBloodGlucose } from "../../api";
import "../../styles/blood-glucose.css";

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
    const d = new Date(iso + "Z"); 
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta"
    }).replace(/\./g, ':');
  } catch (e) { return dateString; }
}

export default function BloodGlucose() {
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [records, setRecords] = useState([]);
  const [latest, setLatest] = useState(null);
  
  // Ambil ID dari user context atau localStorage
  const patientId = user?.patient_id || localStorage.getItem("patient_id");

  async function loadData() {
    if (!patientId) return;
    try {
      const data = await getBloodGlucose(patientId);
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
        setRecords(sorted);
        setLatest(sorted[0]); 
      }
    } catch (err) { console.error(err); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value || !patientId) {
        alert("Sesi berakhir atau data tidak lengkap. Silakan login kembali.");
        return;
    }
    try {
      await addBloodGlucose(parseInt(value), patientId);
      setValue(""); 
      await loadData(); 
    } catch (err) { alert("Gagal simpan data"); }
  }

  const getStatus = (val) => {
    if (val < 70) return { label: "Rendah", color: "risk-low" };
    if (val > 200) return { label: "Sangat Tinggi", color: "risk-high" };
    if (val > 140) return { label: "Tinggi", color: "risk-warn" };
    return { label: "Normal", color: "risk-normal" };
  };

  useEffect(() => { if (patientId) loadData(); }, [patientId]);

  return (
    <div className="glucose-container">
      <div className="premium-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Monitoring Gula Darah</h2>
            <p>ID Pasien Aktif: <strong>{patientId || "Belum Login"}</strong></p>
          </div>
          {latest && (
            <div className={`latest-badge ${getStatus(latest.value).color}`}>
              <div className="badge-val"><span>{latest.value}</span> <small>mg/dL</small></div>
              <div className="badge-status">{getStatus(latest.value).label}</div>
            </div>
          )}
        </div>
      </div>
      <div className="glucose-grid">
        <div className="card input-card">
          <h3>Input Data Baru</h3>
          <form className="inline-form-premium" onSubmit={handleSubmit}>
            <div className="input-with-unit">
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} required />
              <span className="unit-label">mg/dL</span>
            </div>
            <button type="submit" className="btn-save-premium">Simpan Data</button>
          </form>
        </div>
        <div className="card history-card">
          <h3>Riwayat Terakhir</h3>
          <div className="modern-table">
            <div className="table-header"><span>Nilai</span><span>Status</span><span>Waktu (WIB)</span></div>
            <div className="table-body">
              {records.map((r, i) => (
                <div key={i} className="table-row">
                  <span className="row-val"><strong>{r.value}</strong> mg/dL</span>
                  <span className={`row-status ${getStatus(r.value).color}`}>{getStatus(r.value).label}</span>
                  <span className="row-date">{formatDate(r.recorded_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
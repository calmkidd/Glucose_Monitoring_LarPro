import { useEffect, useState } from "react";
import { addMedication, getMedications, getProfile } from "../../api";
import "../../styles/medications.css";

// FUNGSI PERBAIKAN JAM (SELISIH 7 JAM)
function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
    const d = new Date(iso + "Z");
    
    if (isNaN(d.getTime())) return dateString;

    return d.toLocaleString("id-ID", {
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit",
      timeZone: "Asia/Jakarta" 
    }).replace(/\./g, ':');
  } catch (e) {
    return dateString;
  }
}

export default function Medications() {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [schedule, setSchedule] = useState("Pagi"); 
  const [records, setRecords] = useState([]);
  const [patientId, setPatientId] = useState(null);

  // 1. Ambil ID Pasien saat komponen pertama kali dimuat
  useEffect(() => {
    async function init() {
      try {
        const user = await getProfile();
        if (user && (user.patient_id || user.id)) {
          const id = user.patient_id || user.id;
          setPatientId(id);
          loadData(id); // Langsung muat data setelah ID didapat
        }
      } catch (err) {
        console.error("Gagal mengambil profil:", err);
      }
    }
    init();
  }, []);

  // 2. Fungsi Load Data dengan parameter ID
  async function loadData(id) {
    const targetId = id || patientId;
    if (!targetId) return;

    try {
      const data = await getMedications(targetId);
      if (Array.isArray(data)) {
        // Urutkan data berdasarkan waktu terbaru (recorded_at dari DB)
        const sorted = [...data].sort((a, b) => 
          (b.recorded_at || b.created_at).localeCompare(a.recorded_at || a.created_at)
        );
        setRecords(sorted);
      }
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  // 3. Fungsi Submit dengan menyertakan patient_id
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Ambil ID terbaru (bisa dari state atau dari localStorage)
    const currentId = patientId || JSON.parse(localStorage.getItem("user"))?.patient_id;

    if (!currentId) {
      alert("Gagal mendapatkan ID Pasien. Silakan Refresh atau Login ulang.");
      return;
    }

    try {
      await addMedication({
        patient_id: currentId, // Menggunakan ID yang valid
        medication_name: name,
        dosage: dose,
        time_of_day: schedule,
      });
      
      setName("");
      setDose("");
      setSchedule("Pagi");
      await loadData(patientId); // Refresh daftar setelah simpan
      alert("Data obat berhasil disimpan!");
    } catch (err) {
      console.error("Gagal simpan:", err);
      alert("Gagal menyimpan data ke server.");
    }
  }

  return (
    <div className="medication-container">
      <div className="premium-card">
        <div className="premium-header">
          <h2>Monitoring Obat</h2>
          <p>Data tersinkronisasi dengan standar waktu Indonesia Barat (WIB).</p>
        </div>

        <form className="medication-form-premium" onSubmit={handleSubmit}>
          <div className="input-field flex-grow-3">
            <label>Nama Obat</label>
            <input
              type="text"
              placeholder="Metformin / Insulin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-field flex-grow-1">
            <label>Dosis</label>
            <input
              type="text"
              placeholder="500 mg"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              required
            />
          </div>
          <div className="input-field flex-grow-1">
            <label>Jadwal Minum</label>
            <select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
              <option value="Pagi">Pagi</option>
              <option value="Siang">Siang</option>
              <option value="Malam">Malam</option>
            </select>
          </div>
          <button type="submit" className="btn-save-enterprise">Simpan</button>
        </form>
      </div>

      <div className="history-wrapper">
        <h3>Riwayat Konsumsi Obat</h3>
        <div className="medication-list-modern">
          {records.length === 0 && <p className="empty-state">Belum ada data tercatat.</p>}
          {records.map((r, i) => (
            <div key={i} className="medication-item-row">
              <div className="item-main">
                <div className={`schedule-badge ${(r.time_of_day || "Pagi").toLowerCase()}`}>
                  {r.time_of_day || "Pagi"}
                </div>
                <div className="item-info">
                  <strong>{r.medication_name}</strong>
                  <span>{r.dosage}</span>
                </div>
              </div>
              <div className="item-meta">
                <span className="timestamp-label">Waktu Pencatatan</span>
                {/* Gunakan recorded_at sesuai kolom di database Laravel */}
                <span className="timestamp-val">{formatDate(r.recorded_at || r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
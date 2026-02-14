import { useEffect, useState } from "react";
import { addSymptom, getSymptoms, getProfile } from "../../api";
import "../../styles/symptoms.css";

function formatDate(dateString) {
  if (!dateString) return "-";
  const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta"
  });
}

export default function Symptoms() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [note, setNote] = useState("");
  const [records, setRecords] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [patientId, setPatientId] = useState(null);

  const symptomList = [
    { id: "lemas", label: "Badan Terasa Lemas", type: "hypo" },
    { id: "gemetar", label: "Tangan Gemetar", type: "hypo" },
    { id: "keringat", label: "Keringat Dingin", type: "hypo" },
    { id: "pusing", label: "Pusing / Sakit Kepala", type: "hypo" },
    { id: "haus", label: "Sering Merasa Haus", type: "hyper" },
    { id: "kencing", label: "Sering Buang Air Kecil", type: "hyper" },
    { id: "kabur", label: "Penglihatan Kabur", type: "hyper" },
    { id: "mual", label: "Mual / Muntah", type: "hyper" },
    { id: "sesak", label: "Sesak Napas", type: "hyper" },
    { id: "kesemutan", label: "Kesemutan", type: "hyper" },
  ];

  async function loadData(id) {
    const targetId = id || patientId;
    if (!targetId) return;
    try {
      const data = await getSymptoms(targetId);
      if (Array.isArray(data)) {
        setRecords(data);
      }
    } catch (err) { console.error(err); }
  }

  useEffect(() => { 
    async function init() {
      try {
        const user = await getProfile();
        const id = user?.patient_id || user?.id;
        if (id) {
          setPatientId(id);
          loadData(id);
        }
      } catch (err) { console.error("Auth error:", err); }
    }
    init();
  }, []);

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) return alert("Sesi berakhir, silakan login kembali.");
    
    const hypo = symptomList.filter(s => selectedSymptoms.includes(s.id) && s.type === "hypo").map(s => s.label).join(",");
    const hyper = symptomList.filter(s => selectedSymptoms.includes(s.id) && s.type === "hyper").map(s => s.label).join(",");

    try {
      const result = await addSymptom({
        patient_id: patientId,
        hypo_symptoms: hypo || "",
        hyper_symptoms: hyper || "",
        severity: selectedSymptoms.length > 3 ? "Berat" : "Sedang",
        conditions: selectedSymptoms.includes("sesak") ? "Darurat" : "Stabil",
        note: note
      });

      if (result) {
        setShowToast(true);
        setSelectedSymptoms([]);
        setNote("");
        setTimeout(() => { loadData(patientId); setShowToast(false); }, 1000);
      }
    } catch (err) {
      console.error("Detail Error:", err);
      alert("Gagal kirim laporan. Silakan cek koneksi server.");
    }
  };

  return (
    <div className="symptoms-page-container">
      {showToast && <div className="toast-notification">Laporan berhasil terkirim</div>}
      <div className="premium-card">
        <div className="premium-header">
          <h2>Assessment Gejala Harian</h2>
          <p>ID Pasien: {patientId || "Memuat..."}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="symptom-grid">
            {symptomList.map((s) => (
              <div key={s.id} className={`symptom-box ${selectedSymptoms.includes(s.id) ? "active" : ""}`} onClick={() => toggleSymptom(s.id)}>
                <div className="checkbox-custom">{selectedSymptoms.includes(s.id) && <span className="check-mark">✓</span>}</div>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="input-group-premium">
            <label>Catatan Tambahan</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Jelaskan kondisi Anda..." />
          </div>
          <button type="submit" className="btn-submit-premium" disabled={selectedSymptoms.length === 0}>Kirim Assessment</button>
        </form>
      </div>
      <div className="history-wrapper">
        <div className="history-header"><h3>Log Laporan Gejala</h3></div>
        <div className="symptom-history-list">
          {records.length === 0 ? <p>Belum ada riwayat.</p> : records.map((r, i) => (
            <div key={i} className="history-item-card">
              <div className="history-main">
                <div className={`risk-indicator ${(r.severity || "stabil").toLowerCase()}`}>
                    <span className="risk-text">{r.severity || "Sedang"}</span>
                </div>
                <div className="history-content">
                  <div className="symptoms-tags">
                    {[r.hypo_symptoms, r.hyper_symptoms].filter(Boolean).join(", ").split(",").map((tag, idx) => (
                      tag.trim() && <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                  {r.note && <p className="history-note">"{r.note}"</p>}
                </div>
              </div>
              <div className="history-date"><span>{formatDate(r.recorded_at)}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState, useRef } from "react"; // Pastikan useRef ada di sini
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  fetchLatestGlucose, 
  fetchLatestMedication, 
  fetchLatestSymptom, 
  getHealthSummary, 
  getBloodGlucose 
} from "../../api";
import { useAuth } from "../../auth/AuthContext"; 
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

export default function PatientDashboard() {
  const { user } = useAuth(); 
  const navigate = useNavigate();

  // --- STATE DATA ---
  const [glucose, setGlucose] = useState(null);
  const [medication, setMedication] = useState(null);
  const [symptom, setSymptom] = useState(null);
  const [summary, setSummary] = useState({ score: 0, level: "Stabil", recommendations: [] });
  const [glucoseHistory, setGlucoseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eduContent, setEduContent] = useState(null);

  // --- STATE CHAT ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Halo! Saya Asisten AI RSPG. Ada yang bisa saya bantu terkait kondisi kesehatan Anda?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // --- GEMBOK ANTI-DUPLIKASI (useRef) ---
  // Variabel ini berubah secara instan, tidak menunggu render ulang seperti useState.
  const chatLock = useRef(false);

  const patientId = user?.patient_id || localStorage.getItem("patient_id");

  const formatUTCtoWIB = (dateString) => {
    if (!dateString) return "Belum tercatat";
    try {
      const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
      const d = new Date(iso); 
      return isNaN(d) ? "Data tidak valid" : d.toLocaleString("id-ID", { 
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
      }).replace(/\./g, ':');
    } catch (e) { return "Gagal memuat waktu"; }
  };

  const formatXAxis = (tickItem) => {
    if (!tickItem) return "";
    const iso = tickItem.includes(" ") ? tickItem.replace(" ", "T") : tickItem;
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!patientId) return;
      try {
        setLoading(true);
        const [gRes, mRes, sRes, sumRes, histRes] = await Promise.all([
          fetchLatestGlucose(patientId).catch(() => null),
          fetchLatestMedication(patientId).catch(() => null),
          fetchLatestSymptom(patientId).catch(() => null),
          getHealthSummary(patientId).catch(() => ({ score: 0, level: "Stabil", recommendations: [] })),
          getBloodGlucose(patientId).catch(() => [])
        ]);

        if (Array.isArray(histRes) && histRes.length > 0) {
          const sortedNewest = [...histRes].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
          setGlucose(sortedNewest[0]);
          const forChart = [...histRes].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
          setGlucoseHistory(forChart.slice(-7));
        } else { setGlucose(gRes); }

        setMedication(mRes);
        setSymptom(sRes);
        setSummary(sumRes);

        const val = gRes?.value || (histRes[0]?.value);
        if (sumRes?.level === "Kritis" || sumRes?.level === "Buruk" || val > 200) {
          setEduContent({ title: "Tindakan Darurat 🚨", text: "Kondisi memerlukan perhatian segera.", color: "edu-danger" });
        } else if (val > 140) {
          setEduContent({ title: "Tips Kontrol Gula 🥗", text: "Gula darah meningkat, cek daftar makanan sehat.", color: "edu-warning" });
        } else {
          setEduContent({ title: "Kondisi Stabil ✨", text: "Bagus! Jaga pola makan dan olahraga rutin.", color: "edu-success" });
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadDashboardData();
  }, [patientId]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    
    // 1. CEK GEMBOK FISIK: Jika terkunci, langsung STOP pengiriman kedua.
    if (!chatInput.trim() || chatLock.current) return;

    // 2. KUNCI GEMBOK SEKARANG
    chatLock.current = true;
    setIsTyping(true);

    const currentInput = chatInput;
    setMessages(prev => [...prev, { role: "user", text: currentInput }]);
    setChatInput("");
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({
          message: currentInput,
          patient_id: patientId,
          context: { glucose: glucose?.value || 0, status: summary?.level || "Stabil" }
        })
      });

      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: "ai", text: data.reply || data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Maaf, kendala koneksi ke server AI." }]);
    } finally { 
      // 3. BUKA GEMBOK: Beri jeda 500ms agar sistem tidak menerima spam klik.
      setTimeout(() => {
        chatLock.current = false;
        setIsTyping(false);
      }, 500);
    }
  };

  if (loading) return <div className="loader-screen"><div className="loader"></div><p>Sinkronisasi...</p></div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Ringkasan Kesehatan</h1>
          <p>Pasien: <strong>{user?.name || "Pasien"}</strong> • ID: {patientId}</p>
        </div>
        
        {/* WARNA STATUS: Buruk & Kritis dipaksa merah */}
        <div className={`status-pill-premium ${
          summary?.level?.toLowerCase() === 'buruk' || summary?.level?.toLowerCase() === 'kritis' 
            ? 'buruk' 
            : summary?.level?.toLowerCase() === 'waspada' 
            ? 'waspada' 
            : 'stabil'
        }`}>
           <span className="pill-label">STATUS KESEHATAN</span>
           <span className="pill-val">{summary?.level || "STABIL"}</span>
        </div>
      </header>

      {eduContent && (
        <div className={`edu-banner ${eduContent.color}`}>
          <div className="edu-body">
            <h4>{eduContent.title}</h4>
            <p>{eduContent.text}</p>
          </div>
          <button className="btn-detail" onClick={() => navigate("/patient/education")}>Lihat Edukasi</button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-head"><h3>Tren Gula Darah</h3></div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={glucoseHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="recorded_at" tickFormatter={formatXAxis} fontSize={12} stroke="#64748b" />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip labelFormatter={(l) => formatUTCtoWIB(l)} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981' }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card stat-card">
          <span className="card-label">Glukosa Terakhir</span>
          <div className="stat-value">
            <span className="number">{glucose?.value || "--"}</span>
            <span className="unit">mg/dL</span>
          </div>
          <p className="timestamp">🕒 {formatUTCtoWIB(glucose?.recorded_at)}</p>
        </div>

        <div className="card stat-card">
          <span className="card-label">Konsumsi Obat</span>
          <div className="info-box">
            <strong>{medication?.medication_name || "Tidak ada data"}</strong>
            <p>{medication ? `${medication.dosage} • ${medication.time_of_day}` : "Belum ada jadwal"}</p>
          </div>
          <p className="timestamp">🕒 {formatUTCtoWIB(medication?.recorded_at)}</p>
        </div>

        <div className="card stat-card">
          <span className="card-label">Keluhan Gejala</span>
          <div className="info-box">
             {/* Badge BERAT sekarang proporsional */}
             <span className={`badge-severity ${symptom?.severity?.toLowerCase() === 'berat' ? 'berat' : 'aman'}`}>
               {symptom?.severity || "Aman"}
             </span>
             <p>{symptom?.conditions || "Tidak ada keluhan"}</p>
          </div>
          <p className="timestamp">🕒 {formatUTCtoWIB(symptom?.recorded_at)}</p>
        </div>

        <div className="card recom-card">
          <h3>Rekomendasi Medis</h3>
          <div className="recom-list">
            {summary.recommendations?.map((r, i) => (
              <div key={i} className={`recom-item ${r.includes("IGD") || r.includes("Kontak") ? 'critical' : ''}`}>{r}</div>
            ))}
          </div>
        </div>
      </div>

      <div className={`ai-chat-floating ${isChatOpen ? 'open' : ''}`}>
        {!isChatOpen ? (
          <button className="chat-fab" onClick={() => setIsChatOpen(true)}>🤖 Tanya Asisten AI</button>
        ) : (
          <div className="chat-box shadow-premium">
            <div className="chat-header">
              <div className="ai-title"><strong>Medical AI</strong> <span className="online-dot"></span></div>
              <button onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            <div className="chat-messages">
              {messages.map((m, i) => <div key={i} className={`bubble ${m.role}`}>{m.text}</div>)}
              {isTyping && <div className="bubble ai typing">Mengetik...</div>}
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                placeholder={isTyping ? "Tunggu..." : "Tanya sesuatu..."} 
                disabled={isTyping}
              />
              <button type="submit" disabled={isTyping || !chatInput.trim()}>➤</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
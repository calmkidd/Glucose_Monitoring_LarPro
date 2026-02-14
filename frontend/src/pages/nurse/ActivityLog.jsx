import { useEffect, useState } from "react";
import { getActivityLogs } from "../../api"; 
import "../../styles/nurse.css";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getActivityLogs();
      
      console.log("Data Log Terkini:", data); // Untuk memantau data Budi masuk atau tidak

      // Menangani berbagai kemungkinan format data dari Laravel
      let finalData = [];
      if (Array.isArray(data)) {
        finalData = data;
      } else if (data?.logs && Array.isArray(data.logs)) {
        finalData = data.logs;
      } else if (data?.data && Array.isArray(data.data)) {
        finalData = data.data;
      }
      
      setLogs(finalData);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Jalankan pertama kali saat halaman dibuka
    fetchLogs(true);

    // SINKRONISASI OTOMATIS: Ambil data setiap 10 detik agar input Budi langsung muncul
    const interval = setInterval(() => {
      fetchLogs(false);
    }, 10000);

    return () => clearInterval(interval); // Bersihkan interval saat pindah halaman
  }, []);

  if (loading) return (
    <div className="nurse-container">
      <div className="pulse-loader">Memuat riwayat aktivitas...</div>
    </div>
  );

  return (
    <div className="nurse-container">
      <div className="section-header-premium" style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', fontWeight: '800' }}>Log Aktivitas Real-time</h2>
        <p style={{ color: '#64748b' }}>Memantau setiap riwayat input medis pasien secara otomatis.</p>
      </div>

      <div className="timeline-container-premium">
        {logs.length > 0 ? (
          logs.map((log, i) => (
            <div key={log.id || i} className="timeline-card-premium">
              <div className="time-tag">
                {/* Format Jam:Menit */}
                {log.time || (log.created_at ? log.created_at.substring(11, 16) : "--:--")}
              </div>
              
              <div className="log-content-premium">
                {/* Nama User (Budi/Sistem) - Pastikan Hitam */}
                <div className="log-user-name" style={{ color: '#1e293b', fontWeight: '700', fontSize: '16px' }}>
                  {log.user || log.user_name || "Sistem"}
                </div>
                {/* Detail Aksi - Pastikan Hitam/Abu Gelap */}
                <div className="log-action-detail" style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
                  {log.action} — <span className="status-highlight-green">{log.status || "Stabil"}</span>
                </div>
              </div>
              <div className="live-status-pulse"></div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ color: '#64748b', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>📋</div>
            <p>Belum ada aktivitas yang tercatat dari database.</p>
            <small>Coba input data melalui akun pasien untuk melihat perubahan.</small>
          </div>
        )}
      </div>
    </div>
  );
}
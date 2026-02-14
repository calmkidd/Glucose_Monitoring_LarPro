import { useEffect, useState } from "react";
import "../../styles/nurse.css";

export default function TriageReport() {
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const headers = { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        };

        // 1. Ambil data User/Nurse yang sedang login (Email: nurse@rspg.com)
        try {
          const userRes = await fetch("http://127.0.0.1:8000/api/user", { headers });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData); 
          } else {
            console.error("Gagal mengambil profil nurse, status:", userRes.status);
          }
        } catch (e) {
          console.warn("Koneksi ke profil nurse gagal.");
        }

        // 2. Ambil data pasien triage
        const reportRes = await fetch("http://127.0.0.1:8000/api/nurse/patients-summary", { headers });
        const reportData = await reportRes.json();
        
        if (reportData && Array.isArray(reportData.patients)) {
          setReports(reportData.patients);
        }
      } catch (err) {
        console.error("Gagal memuat data laporan:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="nurse-container">
      <div className="pulse-loader">Menyusun Laporan Medis...</div>
    </div>
  );

  return (
    <div className="triage-report-page">
      {/* HEADER DASHBOARD - HILANG SAAT PRINT */}
      <div className="section-header-premium no-print">
        <div className="header-info">
          <h2 style={{ color: '#1e293b', fontWeight: '800' }}>Laporan Triage Pasien</h2>
          <p style={{ color: '#64748b' }}>Rekapitulasi status risiko pasien untuk dokumentasi medis resmi.</p>
        </div>
        <button className="btn-print-medical" onClick={handlePrint}>
          <span className="icon">🖨️</span> Cetak Laporan PDF
        </button>
      </div>

      {/* KARTU MONITORING - HILANG SAAT PRINT */}
      <div className="triage-cards-container no-print">
        {reports.length > 0 ? reports.map((d, i) => (
          <div key={i} className={`triage-report-card ${d.severity?.toLowerCase() || 'stabil'}`}>
            <div className="report-main">
              <h4 style={{ color: '#1e293b', fontWeight: '700' }}>{d.name}</h4>
              <p className="rm-sub">No. RM: {d.rm}</p>
              <div className="glucose-info" style={{ color: '#1e293b' }}>
                Gula Darah Terakhir: <strong>{d.latest_glucose} mg/dL</strong>
              </div>
            </div>
            <div className="status-badge-container">
              <span className={`status-badge-premium ${d.severity?.toLowerCase() || 'stabil'}`}>
                {d.severity || 'STABIL'}
              </span>
              <small>Update: {d.last_visit}</small>
            </div>
          </div>
        )) : <p>Tidak ada data pasien untuk ditampilkan.</p>}
      </div>

      {/* AREA DOKUMEN RESMI - HANYA MUNCUL SAAT PRINT */}
      <div className="print-area-document">
        <div className="print-kop-surat">
          <div className="kop-header">
            <img src="/Logo_pgm.png" alt="Logo PGM" className="print-logo-img" />
            <div className="hospital-details">
              <h1>RS PETROKIMIA GRESIK</h1>
              <p>Jl. Jenderal Ahmad Yani No.80, Gresik | Telp: (031) 3987000</p>
              <p>Email: info@rspg.it | Website: www.rspg.it</p>
            </div>
          </div>
          <hr className="kop-divider-double" />
          <h2 className="document-title">LAPORAN PEMANTAUAN TRIAGE DIABETES</h2>
          <p className="document-subtitle">Dicetak otomatis melalui Sistem Monitoring Gula Darah</p>
        </div>

        <table className="medical-print-table">
          <thead>
            <tr>
              <th>No. RM</th>
              <th>Nama Pasien</th>
              <th>Gula Darah</th>
              <th>Status Triage</th>
              <th>Waktu Update</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((d, i) => (
              <tr key={i}>
                <td>{d.rm}</td>
                <td>{d.name}</td>
                <td style={{ textAlign: 'center' }}>{d.latest_glucose} mg/dL</td>
                <td className={`status-cell-${d.severity?.toLowerCase() || 'stabil'}`} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {(d.severity || 'STABIL').toUpperCase()}
                </td>
                <td>{d.last_visit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-footer-signature">
          <div className="signature-wrapper">
            <p className="print-date">
              Gresik, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="job-title">Petugas Medis,</p>
            <div className="signature-gap"></div>
            <p className="officer-name-signed">
              {/* NAMA AKAN BERUBAH SESUAI USER YANG LOGIN (nurse@rspg.com) */}
              <strong>( {user?.name || user?.display_name || 'Iqbal Zuhdi V, S.Kep'} )</strong>
            </p>
            <p className="nip-detail">NIP: {user?.id_karyawan || 'PGM-001'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
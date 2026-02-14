import { useEffect, useState } from "react";
import { getDetailedPatients } from "../../api"; // Pastikan fungsi ini memanggil /api/nurse/patients-summary
import "../../styles/nurse.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const response = await getDetailedPatients();
        
        // Handle berbagai kemungkinan struktur response API
        const data = response?.patients || response || [];
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal load data pasien:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const handleManageClick = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const filteredPatients = patients.filter(p => 
    (p?.name?.toLowerCase() ?? "").includes(search.toLowerCase()) || 
    (p?.rm?.toString().toLowerCase() ?? "").includes(search.toLowerCase())
  );

  // Fungsi helper untuk warna status
  const getSeverityClass = (value) => {
    if (!value) return "status-normal";
    if (value > 200) return "status-critical";
    if (value > 140) return "status-warning";
    return "status-normal";
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="pulse-loader"></div>
      <p>Mengambil Data Medis...</p>
    </div>
  );

  return (
    <div className="patients-container-premium">
      {/* Header Section */}
      <div className="header-glass-premium">
        <div className="header-info">
          <h2>Database Pasien Terdaftar</h2>
          <p>Memantau <strong>{patients.length} Pasien</strong> secara real-time.</p>
        </div>
        
        <div className="search-wrapper-premium">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Cari Nama atau No. RM..." 
            className="input-search-premium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Section */}
      <div className="patient-grid-premium">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((p) => (
            <div key={p?.id} className={`patient-card-glass ${getSeverityClass(p?.latest_glucose)}`}>
              <div className="card-top">
                <div className="avatar-letter">
                  {p?.name ? p.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="basic-info">
                  <h4>{p?.name ?? "Tanpa Nama"}</h4>
                  <p>{p?.rm ?? "No RM -"} • <span className="age-tag">Pasien RSPG</span></p>
                </div>
                {/* Indikator Titik Kecil */}
                <div className={`pulse-dot ${getSeverityClass(p?.latest_glucose)}`}></div>
              </div>
              
              <div className="card-middle">
                <div className="info-row">
                  <span className="label">Gula Darah Terakhir</span>
                  <span className="value-highlight">
                    {p?.latest_glucose ?? "--"} <small>mg/dL</small>
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Kunjungan</span>
                  <span className="value">{p?.last_visit ?? "Baru"}</span>
                </div>
              </div>
              
              <button className="btn-manage-premium" onClick={() => handleManageClick(p)}>
                Kelola Pasien
                <span className="btn-arrow">→</span>
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state-container">
             <div className="empty-icon">📁</div>
             <p>Data pasien tidak ditemukan.</p>
             <small>Pastikan perawat sudah menginput data di menu Registrasi Pasien.</small>
          </div>
        )}
      </div>

      {/* Modal Detail Pasien */}
      {isModalOpen && selectedPatient && (
        <div className="modal-overlay-premium" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-premium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="header-title-block">
                <h3>{selectedPatient?.name}</h3>
                <span className="rm-badge-modal">{selectedPatient?.rm}</span>
              </div>
              <button className="btn-close-x" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="modal-body-premium">
              <div className="quick-stats-grid">
                <div className={`stat-card-modal ${getSeverityClass(selectedPatient?.latest_glucose)}`}>
                  <label>Glukosa Terakhir</label>
                  <p>{selectedPatient?.latest_glucose ?? "--"} <span>mg/dL</span></p>
                </div>
                <div className="stat-card-modal">
                  <label>Status Akun</label>
                  <p style={{color: selectedPatient?.status === 'Aktif' ? '#008744' : '#64748b'}}>
                    {selectedPatient?.status ?? "Aktif"}
                  </p>
                </div>
              </div>

              <div className="action-stack-premium">
                  <button className="btn-modal-action action-view" onClick={() => alert('Fitur Grafik Historis sedang disiapkan.')}>
                     📊 Lihat Grafik Historis Lengkap
                  </button>
                  <div className="action-row-split">
                    <a 
                      href={`https://wa.me/${selectedPatient?.phone}`} 
                      target="_blank" 
                      className="btn-modal-action action-wa"
                      style={{textDecoration: 'none', textAlign: 'center'}}
                    >
                      💬 Kirim WhatsApp
                    </a>
                    <button className="btn-modal-action action-emergency">
                      🚨 Kondisi Darurat
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
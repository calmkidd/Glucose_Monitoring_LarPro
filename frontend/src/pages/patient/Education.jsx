import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/education.css";

export default function Education() {
  const nutritionData = [
    { type: "high", label: "Bebas Konsumsi", items: ["Sayuran Hijau", "Ikan & Ayam", "Telur", "Almond/Kacang"], color: "green" },
    { type: "mid", label: "Batasi Porsi", items: ["Nasi Merah", "Buah (Apel/Pir)", "Roti Gandum"], color: "yellow" },
    { type: "low", label: "Hindari", items: ["Minuman Bersoda", "Gula Pasir", "Gorengan/Tepung"], color: "red" }
  ];

  const emergencyActions = [
    { title: "Gula Darah Rendah (<70)", steps: ["Konsumsi 15g gula (1 sdm gula pasir)", "Tunggu 15 menit, cek kembali gula darah", "Makan biskuit atau nasi setelah kondisi stabil"] },
    { title: "Gula Darah Tinggi (>250)", steps: ["Minum air putih lebih banyak untuk hidrasi", "Hindari aktivitas fisik berat sementara waktu", "Segera hubungi dokter jika merasa mual atau sesak"] }
  ];

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          element.classList.add("highlight-article");
        }, 300);
      }
    }
  }, [location]);

  return (
    <div className="education-container">
      <header className="edu-header">
        <h1>Pusat Navigasi Kesehatan</h1>
        <p>Manajemen diabetes mandiri sesuai standar RS Petrokimia Gresik.</p>
      </header>

      {/* ARTIKEL PENANGANAN DARURAT */}
      <section id="emergency-handling" className="edu-article">
        <h2 className="article-title">Protokol Darurat: Hipoglikemia & Hiperglikemia</h2>
        <div className="article-content">
          <p>Kondisi gula darah ekstrem memerlukan tindakan cepat untuk mencegah komplikasi fatal. Penanganan yang tepat dapat menstabilkan kadar glukosa sebelum bantuan medis tiba.</p>
          <ul className="guideline-list">
            <li><strong>Hipoglikemia:</strong> Gunakan metode "Aturan 15-15". Konsumsi 15 gram karbohidrat cepat serap (seperti jus atau air gula), tunggu 15 menit, dan cek kembali hingga mencapai angka aman.</li>
            <li><strong>Hiperglikemia:</strong> Dehidrasi adalah risiko utama saat kadar gula terlalu tinggi. Pastikan asupan cairan cukup untuk membantu ginjal membuang kelebihan glukosa melalui urin.</li>
          </ul>
        </div>
      </section>
      
      {/* ARTIKEL NUTRISI */}
      <section id="low-gi-foods" className="edu-article">
        <h2 className="article-title">Strategi Nutrisi Indeks Glikemik (IG) Rendah</h2>
        <div className="article-content">
          <p>Memilih makanan dengan IG rendah memperlambat pemecahan karbohidrat menjadi glukosa. Hal ini sangat efektif untuk mencegah lonjakan gula darah yang drastis setelah makan.</p>
          <p>Fokuslah pada serat larut yang terdapat pada sayuran hijau dan kacang-kacangan. Ganti karbohidrat sederhana seperti nasi putih dengan nasi merah atau ubi-umbian yang dimasak dengan cara direbus atau dikukus.</p>
        </div>
      </section>

      {/* ARTIKEL LIFESTYLE */}
      <section id="lifestyle-tips" className="edu-article">
        <h2 className="article-title">Tips Hidup Sehat Mandiri</h2>
        <div className="article-content">
          <p>Manajemen diabetes jangka panjang sangat bergantung pada perubahan gaya hidup yang konsisten dan berkelanjutan.</p>
          <ol className="guideline-list">
            <li><strong>Aktivitas Fisik:</strong> Olahraga aerobik sedang (jalan cepat) minimal 150 menit per minggu dapat meningkatkan sensitivitas insulin secara signifikan.</li>
            <li><strong>Manajemen Stres:</strong> Tingkat stres yang tinggi memicu hormon kortisol yang meningkatkan gula darah. Praktikkan teknik relaksasi harian.</li>
            <li><strong>Monitor Berkala:</strong> Pencatatan mandiri membantu tim medis di RSPG mengevaluasi efektivitas terapi Anda.</li>
          </ol>
        </div>
      </section>

      {/* BENTO GRID UTAMA */}
      <div className="bento-grid">
        {/* SECTION A: NUTRITION BOARD */}
        <div className="bento-item nutrition-board premium-shadow">
          <h3 className="section-title">Panduan Nutrisi Harian</h3>
          <div className="nutrition-cards">
            {nutritionData.map((group, i) => (
              <div key={i} className={`nutri-card ${group.color}`}>
                <div className="nutri-status">{group.label}</div>
                <ul className="nutri-list">
                  {group.items.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B: EMERGENCY PROTOCOL */}
        <div className="bento-item action-protocol premium-shadow">
          <div className="section-header-flex">
            <h3 className="section-title">Protokol Tindakan Mandiri</h3>
          </div>
          
          <div className="protocol-container">
            {emergencyActions.map((action, i) => (
              <div key={i} className="protocol-group">
                <h4 className="protocol-subtitle">{action.title}</h4>
                <div className="step-list-modern">
                  {action.steps.map((step, idx) => (
                    <div key={idx} className="step-row-inline">
                      <span className="step-number">{idx + 1}.</span>
                      <p className="step-text-content">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION C: RADAR KEWASPADAAN */}
        <div className="bento-item warning-radar premium-shadow">
          <div className="section-header-flex">
            <h3 className="section-title">Radar Kewaspadaan Gejala</h3>
          </div>
          
          <div className="radar-grid-modern">
            <div className="warning-card-premium hipo">
              <div className="card-accent"></div>
              <div className="card-content">
                <div className="card-top">
                  <strong>Hipoglikemia</strong>
                </div>
                <p>Keringat dingin, gemetar, pusing mendadak.</p>
              </div>
            </div>

            <div className="warning-card-premium hiper">
              <div className="card-accent"></div>
              <div className="card-content">
                <div className="card-top">
                  <strong>Hiperglikemia</strong>
                </div>
                <p>Haus berlebih, sering kencing, lemas berat.</p>
              </div>
            </div>
          </div>

          <div className="emergency-call-premium">
            <div className="call-info">
              <span className="pulse-dot"></span>
              <p>Butuh Bantuan Darurat?</p>
            </div>
            <button className="btn-call-rs" onClick={() => window.location.href='tel:0313987000'}>
              Hubungi IGD RSPG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
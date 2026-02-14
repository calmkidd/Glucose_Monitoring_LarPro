import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [mrn, setMrn] = useState("");
  const navigate = useNavigate();

  const loadPatients = async () => {
    const res = await fetch(`${API}/patients`);
    const data = await res.json();
    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const addPatient = async () => {
    if (!name || !mrn) {
      alert("Nama dan MRN wajib diisi");
      return;
    }

    await fetch(`${API}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mrn }),
    });

    setName("");
    setMrn("");
    loadPatients();
  };

  return (
    <div>
      <h2>Manajemen Pasien</h2>

      {/* FORM INPUT */}
      <div className="card">
        <h3>Tambah Pasien</h3>

        <input
          placeholder="Nama Pasien"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "8px" }}
        />

        <input
          placeholder="MRN"
          value={mrn}
          onChange={(e) => setMrn(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />

        <button onClick={addPatient}>Simpan Pasien</button>
      </div>

      {/* LIST PASIEN */}
      <h3>Daftar Pasien</h3>

      {patients.length === 0 && <p>Belum ada pasien</p>}

      {patients.map((p) => (
        <div
          key={p.id}
          className="card"
          onClick={() => navigate(`/patient/${p.id}`)}
        >
          <strong>{p.name}</strong>
          <div>MRN: {p.mrn}</div>
        </div>
      ))}
    </div>
  );
}

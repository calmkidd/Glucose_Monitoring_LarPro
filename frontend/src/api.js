const API_URL = "http://localhost:8000/api";

function authHeader() {
  const token = localStorage.getItem("access_token"); 
  
  // Gunakan satu objek header yang konsisten
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function handleFetch(url, options = {}) {
  try {
    const res = await fetch(url, { 
      ...options, 
      headers: { ...authHeader(), ...options.headers } 
    });
    
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
}

// AUTH
export const login = (email, password) => 
  fetch(`${API_URL}/auth/login`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json", "Accept": "application/json" }, 
    body: JSON.stringify({ email, password }) 
  }).then(res => res.json());

export const getProfile = () => handleFetch(`${API_URL}/auth/me`);

// NURSE - Perbaikan Endpoint
// NURSE - Pastikan kedua nama ini diekspor
export const getPatients = () => handleFetch(`${API_URL}/nurse/patients-summary`);
export const getDetailedPatients = () => handleFetch(`${API_URL}/nurse/patients-summary`);
// NURSE ACTIVITY LOG
export const getActivityLogs = () => handleFetch(`${API_URL}/nurse/activity-log`);

// BLOOD GLUCOSE
export const addBloodGlucose = (value, patient_id) => 
  handleFetch(`${API_URL}/patient/blood-glucose`, { method: "POST", body: JSON.stringify({ value, patient_id }) });

export const getBloodGlucose = (patient_id) => 
  handleFetch(`${API_URL}/patient/blood-glucose?patient_id=${patient_id}`);

export const fetchLatestGlucose = async (patient_id) => {
  const data = await getBloodGlucose(patient_id);
  return (Array.isArray(data) && data.length > 0) ? data[0] : null;
};

// MEDICATIONS
export const addMedication = (payload) => 
  handleFetch(`${API_URL}/patient/medications`, { method: "POST", body: JSON.stringify(payload) });

export const getMedications = (patient_id) => 
  handleFetch(`${API_URL}/patient/medications?patient_id=${patient_id}`);

export const fetchLatestMedication = async (patient_id) => {
  const data = await getMedications(patient_id);
  return (Array.isArray(data) && data.length > 0) ? data[0] : null;
};

// SYMPTOMS
export const addSymptom = (payload) => 
  handleFetch(`${API_URL}/patient/symptoms`, { method: "POST", body: JSON.stringify(payload) });

export const getSymptoms = (patient_id) => 
  handleFetch(`${API_URL}/patient/symptoms?patient_id=${patient_id}`);

export const fetchLatestSymptom = async (patient_id) => {
  const data = await getSymptoms(patient_id);
  return (Array.isArray(data) && data.length > 0) ? data[0] : null;
};

// SUMMARY
export const getHealthSummary = (patient_id) => 
  handleFetch(`${API_URL}/patient/health-summary?patient_id=${patient_id}`);
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);
const API_URL = "http://127.0.0.1:8000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      // PERBAIKAN: Cek data.user (karena Backend mengirim {access_token, user: {...}})
      if (!res.ok || !data.access_token || !data.user) return false;

      // 1. Simpan Token
      localStorage.setItem("access_token", data.access_token);
      
      // 2. Simpan Objek User Utuh (Berisi role, patient_id, dll)
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // 3. Simpan key individu untuk kemudahan api.js (Optional tapi membantu)
      localStorage.setItem("role", data.user.role);
      if (data.user.patient_id) {
        localStorage.setItem("patient_id", data.user.patient_id.toString());
      }

      // 4. Update State
      setUser(data.user);
      
      return data; 
    } catch (err) {
      console.error("Login Error:", err);
      return false;
    }
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
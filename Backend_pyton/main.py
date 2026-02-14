from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import json
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
from google import genai

# ======================
# CONFIG & AUTH
# ======================
SECRET_KEY = "dev-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DB_NAME = "GulaDarah_monitor.db"

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

app = FastAPI(title="Diabetes Monitoring System - RS Petrokimia Gresik")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# KONFIGURASI AI GEMINI (FASTAPI VERSION)
client = genai.Client(
    api_key="AIzaSyDWn4HpL3u0KXpFK2J22_uEkEVvHvVogoE",
    http_options={'api_version': 'v1beta'}
)

# ======================
# MODELS (PYDANTIC)
# ======================
class UserRegister(BaseModel):
    email: str
    password: str
    role: str
    patient_id: Optional[int] = None

class UserLogin(BaseModel):
    email: str
    password: str

class BloodGlucoseCreate(BaseModel):
    value: int

class MedicationCreate(BaseModel):
    medication_name: str
    dosage: str
    time_of_day: str

class SymptomCreate(BaseModel):
    hypo_symptoms: str
    hyper_symptoms: str
    severity: str
    conditions: str
    note: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: dict

# ======================
# DATABASE UTILS
# ======================
def get_db():
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS patient (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        mrn TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        patient_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS blood_glucose_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        value INTEGER NOT NULL,
        recorded_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS medication_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        medication_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        time_of_day TEXT NOT NULL,
        taken_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS symptom_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        hypo_symptoms TEXT,
        hyper_symptoms TEXT,
        severity TEXT,
        conditions TEXT,
        risk_level TEXT,
        risk_label TEXT,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    """)
    conn.commit()
    conn.close()

init_db()

# ======================
# AUTH LOGIC
# ======================
def hash_password(password: str): return pwd_context.hash(password)
def verify_password(password: str, hashed: str): return pwd_context.verify(password, hashed)

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Sesi habis, silakan login kembali")
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

# ======================
# HEALTH ENGINE
# ======================
def analyze_health_status(patient_id):
    conn = get_db()
    glucose = conn.execute("SELECT value FROM blood_glucose_log WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1", (patient_id,)).fetchone()
    symptom = conn.execute("SELECT risk_label, severity, conditions FROM symptom_log WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1", (patient_id,)).fetchone()
    conn.close()

    score = 100
    recommendations = []
    need_hospital = False

    if glucose:
        val = glucose['value']
        if val < 70:
            score -= 40
            recommendations.append("Gula darah RENDAH (Hipoglikemia). Segera konsumsi gula cepat serap.")
        elif val > 200:
            score -= 40
            recommendations.append("Gula darah SANGAT TINGGI. Batasi karbohidrat dan cukupi air putih.")
        elif val > 140:
            score -= 20
            recommendations.append("Gula darah agak tinggi. Lakukan aktivitas fisik ringan.")

    if symptom:
        if symptom['risk_label'] == "Bahaya" or symptom['conditions'] == "Darurat":
            score -= 50
            need_hospital = True
        elif symptom['risk_label'] == "Waspada":
            score -= 20

    level = "Sangat Baik"
    if score < 40 or need_hospital:
        level = "Kritis"
        recommendations.append("SEGERA hubungi IGD RS Petrokimia Gresik (031-3987000).")
    elif score < 75:
        level = "Kurang Baik"
        recommendations.append("Kondisi tidak stabil. Jadwalkan konsultasi di RS Petrokimia Gresik.")

    return {"score": max(0, score), "level": level, "recommendations": recommendations}

# ======================
# API ENDPOINTS
# ======================

@app.post("/auth/register")
def register(data: UserRegister):
    conn = get_db()
    try:
        conn.execute("INSERT INTO user (email, password_hash, role, patient_id) VALUES (?, ?, ?, ?)",
            (data.email, hash_password(data.password), data.role, data.patient_id))
        conn.commit()
    except sqlite3.IntegrityError: raise HTTPException(status_code=400, detail="Email terdaftar")
    finally: conn.close()
    return {"message": "Registered"}

@app.post("/auth/login")
def login(data: UserLogin):
    conn = get_db()
    user = conn.execute("SELECT * FROM user WHERE email = ?", (data.email,)).fetchone()
    conn.close()
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email / password salah")
    token = create_access_token({"sub": user["email"], "role": user["role"], "patient_id": user["patient_id"]})
    return {"access_token": token, "role": user["role"]}

@app.post("/patient/blood-glucose")
def add_glucose(data: BloodGlucoseCreate, user=Depends(get_current_user)):
    conn = get_db()
    conn.execute("INSERT INTO blood_glucose_log (patient_id, value) VALUES (?, ?)", (user["patient_id"], data.value))
    conn.commit(); conn.close()
    return {"status": "ok"}

@app.get("/patient/blood-glucose")
def list_glucose(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("SELECT value, recorded_at FROM blood_glucose_log WHERE patient_id = ? ORDER BY recorded_at DESC", (user["patient_id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/patient/medications")
def add_med(data: MedicationCreate, user=Depends(get_current_user)):
    conn = get_db()
    conn.execute("INSERT INTO medication_log (patient_id, medication_name, dosage, time_of_day) VALUES (?, ?, ?, ?)",
        (user["patient_id"], data.medication_name, data.dosage, data.time_of_day))
    conn.commit(); conn.close()
    return {"status": "ok"}

@app.get("/patient/medications")
def get_meds(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("SELECT medication_name, dosage, time_of_day as schedule, taken_at as created_at FROM medication_log WHERE patient_id = ? ORDER BY taken_at DESC", (user["patient_id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/patient/symptoms")
def add_symp(data: SymptomCreate, user=Depends(get_current_user)):
    h_list = [s for s in data.hypo_symptoms.split(",") if s.strip()]
    hy_list = [s for s in data.hyper_symptoms.split(",") if s.strip()]
    total = len(h_list) + len(hy_list)
    label, lv = "Aman", "Low"
    if total >= 3 or data.conditions == "Darurat" or data.severity == "Berat": label, lv = "Bahaya", "High"
    elif total >= 1 or data.severity == "Sedang": label, lv = "Waspada", "Medium"
    conn = get_db()
    conn.execute("""INSERT INTO symptom_log (patient_id, hypo_symptoms, hyper_symptoms, severity, conditions, risk_level, risk_label, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)""", (user["patient_id"], data.hypo_symptoms, data.hyper_symptoms, data.severity, data.conditions, lv, label, data.note))
    conn.commit(); conn.close()
    return {"status": "ok"}

@app.get("/patient/symptoms")
def get_symps(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM symptom_log WHERE patient_id = ? ORDER BY created_at DESC", (user["patient_id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/patient/health-summary")
def get_summary(user=Depends(get_current_user)):
    return analyze_health_status(user["patient_id"])

@app.get("/auth/me")
def get_profile(user=Depends(get_current_user)):
    conn = get_db()
    user_data = conn.execute("""SELECT u.email, u.role, p.name as patient_name, p.mrn FROM user u 
        LEFT JOIN patient p ON u.patient_id = p.id WHERE u.email = ?""", (user["sub"],)).fetchone()
    conn.close()
    if not user_data: raise HTTPException(status_code=404, detail="User tidak ditemukan")
    res = dict(user_data)
    if res['role'] == 'nurse':
        res['display_name'] = "Ns. Siti (Internal Medicine)"
        res['id_karyawan'] = "NIP-RSPG-2024"
    else: res['display_name'] = res['patient_name']
    return res

# --- AI CHATBOT ENDPOINT (FASTAPI) ---
# Inisialisasi Client Baru

@app.post("/api/chat")
async def chat_ai(data: ChatRequest):
    try:
        user_message = data.message
        health_context = data.context
        
        prompt = f"Pasien RSPG bertanya: {user_message}. Konteks: Gula darah {health_context.get('glucose')}"
        
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        
        return {"reply": response.text}

    except Exception as e:
        # Jika masih 404, kita akan cetak daftar model yang tersedia di terminal Anda
        print(f"DETAIL ERROR AI: {e}")
        return {"reply": "Maaf, asisten AI sedang melakukan kalibrasi. Mohon coba sesaat lagi."}


# --- NURSE SECTION ---
@app.get("/nurse/patients-summary")
def get_nurse_dashboard_summary(user=Depends(get_current_user)):
    if user["role"] != "nurse": raise HTTPException(status_code=403, detail="Akses ditolak")
    conn = get_db()
    patients_data = conn.execute("""
        SELECT p.id, p.name, p.mrn as rm, bg.value as glucose_value, bg.recorded_at as last_bg_time,
               sl.risk_label as triage_status, sl.created_at as last_symptom_time
        FROM patient p
        LEFT JOIN (SELECT patient_id, value, recorded_at FROM blood_glucose_log GROUP BY patient_id HAVING MAX(recorded_at)) bg ON p.id = bg.patient_id
        LEFT JOIN (SELECT patient_id, risk_label, created_at FROM symptom_log GROUP BY patient_id HAVING MAX(created_at)) sl ON p.id = sl.patient_id
    """).fetchall()
    conn.close()
    formatted = []
    for p in patients_data:
        glc = p['glucose_value'] or 0
        raw = p['triage_status'] or "Stabil"
        st = "Stabil"
        if glc > 200 or raw == "Bahaya": st = "Bahaya"
        elif glc > 140 or raw == "Waspada": st = "Waspada"
        formatted.append({"id": p['id'], "name": p['name'], "rm": p['rm'], "glucose": glc, "status": st, "last_update": p['last_bg_time'] or "N/A", "trend": "up" if glc > 180 else "stable"})
    return formatted
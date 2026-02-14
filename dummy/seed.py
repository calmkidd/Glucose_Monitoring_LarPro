import sqlite3
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

DB_NAME = "GulaDarah_monitor.db"
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def seed_data():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()

    print("Cleaning old data...")
    cur.execute("DELETE FROM symptom_log")
    cur.execute("DELETE FROM medication_log")
    cur.execute("DELETE FROM blood_glucose_log")
    cur.execute("DELETE FROM user")
    cur.execute("DELETE FROM patient")

    # 1. DATA PASIEN
    patients = [
        ("Budi Santoso", "RSPG-001"),
        ("Siti Aminah", "RSPG-042"),
        ("Agus Widodo", "RSPG-088"),
        ("Eko Prasetyo", "RSPG-102"),
        ("Dewi Lestari", "RSPG-215")
    ]

    patient_ids = []
    for i, (name, mrn) in enumerate(patients):
        cur.execute("INSERT INTO patient (name, mrn) VALUES (?, ?)", (name, mrn))
        # Menggunakan atribut yang benar: lastrowid
        patient_ids.append(cur.lastrowid)

    # 2. DATA USER
    cur.execute("INSERT INTO user (email, password_hash, role) VALUES (?, ?, ?)",
                ("nurse@rspg.com", hash_password("nurse123"), "nurse"))
    
    for i, pid in enumerate(patient_ids):
        email = f"{patients[i][0].lower().replace(' ', '.')}@email.com"
        cur.execute("INSERT INTO user (email, password_hash, role, patient_id) VALUES (?, ?, ?, ?)",
                    (email, hash_password("pasien123"), "patient", pid))

    # 3. LOG GULA DARAH
    now = datetime.now()
    for pid in patient_ids:
        for j in range(3):
            val = random.randint(90, 260)
            recorded_at = (now - timedelta(hours=j*2)).strftime('%Y-%m-%d %H:%M:%S')
            cur.execute("INSERT INTO blood_glucose_log (patient_id, value, recorded_at) VALUES (?, ?, ?)",
                        (pid, val, recorded_at))

    # 4. LOG KELUHAN
    cur.execute("""INSERT INTO symptom_log (patient_id, hypo_symptoms, hyper_symptoms, severity, conditions, risk_level, risk_label, note) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""", 
                (patient_ids[0], "", "Haus berlebih", "Berat", "Darurat", "High", "Bahaya", "Pasien Lemas"))

    conn.commit()
    conn.close()
    print("✓ Seed data successfully inserted!")
    print("Nurse Login: nurse@rspg.com / nurse123")

if __name__ == "__main__":
    seed_data()
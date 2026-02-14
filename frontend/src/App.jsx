import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";
import PrivateRoute from "./auth/PrivateRoute";
import ActivateAccount from "./auth/ActivateAccount";

import NurseLayout from "./layouts/NurseLayout";
import PatientLayout from "./layouts/PatientLayout";

import PatientDashboard from "./pages/patient/Dashboard";
import BloodGlucose from "./pages/patient/BloodGlucose";
import Medications from "./pages/patient/Medications";
import Symptoms from "./pages/patient/Symptoms";
import Education from "./pages/patient/Education"; 
import Account from "./pages/patient/Account";

import NurseDashboard from "./pages/nurse/NurseDashboard";
import NurseAddPatient from "./pages/nurse/NurseAddPatient";
import Patients from "./pages/nurse/Patients";
import ActivityLog from "./pages/nurse/ActivityLog";
import TriageReport from "./pages/nurse/TriageReport";
import NurseProfile from "./pages/nurse/NurseProfile";

/* =======================
   PROTECTED ROUTE LOGIC
======================= */
function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{padding: "20px"}}>Memvalidasi Sesi...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

/* =======================
   MAIN APP ROUTES
======================= */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<ActivateAccount />} />

      {/* NURSE ROUTES */}
      <Route
        path="/nurse/*"
        element={
          <ProtectedRoute role="nurse">
            <NurseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NurseDashboard />} />
        <Route path="add-patient" element={<NurseAddPatient />} />
        <Route path="patients" element={<Patients />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="triage-reports" element={<TriageReport />} />
        <Route path="profile" element={<NurseProfile />} />
        
      </Route>

      {/* PATIENT ROUTES */}
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute role="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        {/* Rute Index (Otomatis ke Dashboard) */}
        <Route index element={<PatientDashboard />} />
        
        {/* Rute Relatif (Tanpa '/' di depan agar tidak error absolute path) */}
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="glucose" element={<BloodGlucose />} />
        <Route path="meds" element={<Medications />} />
        <Route path="symptoms" element={<Symptoms />} />
        <Route path="education" element={<Education />} /> 
        <Route path="account" element={<Account />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
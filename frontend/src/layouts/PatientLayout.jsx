import { Outlet } from "react-router-dom";
import PatientSidebar from "../components/PatientSidebar";
import PatientHeader from "../components/PatientHeader";

export default function PatientLayout() {
  return (
    <div className="app-layout-wrapper"> {/* Kunci Utama Layout Flex */}
      <PatientSidebar /> 
      <div className="main-content-area">
        <PatientHeader />
        <div className="content-padding">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
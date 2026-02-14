import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";


export default function NurseSidebar() {
  return (
    <div className="sidebar">
      <h3>HD Monitoring</h3>

      <NavLink to="/nurse">🏠 Dashboard</NavLink>
      <NavLink to="/nurse/patients">👥 Pasien</NavLink>
      <NavLink to="/nurse/schedules">📅 Jadwal HD</NavLink>
      <NavLink to="/nurse/checklist">✅ Checklist</NavLink>
      <NavLink to="/nurse/reminders">🔔 Reminder</NavLink>
      <NavLink to="/nurse/activity">📊 Aktivitas</NavLink>
      <NavLink to="/nurse/settings">⚙️ Pengaturan</NavLink>
    </div>
  );
}

// src/components/StatusCard.jsx
import "../styles/patient.css";

export default function StatusCard({ status, title, description }) {
  return (
    <div className={`status-card ${status}`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

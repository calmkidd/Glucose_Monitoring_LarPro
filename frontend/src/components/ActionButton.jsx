// src/components/ActionButton.jsx
import "../styles/patient.css";

export default function ActionButton({ icon, label, onClick }) {
  return (
    <button className="action-button" onClick={onClick}>
      <span className="icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

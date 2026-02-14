// src/components/SectionCard.jsx
import "../styles/patient.css";

export default function SectionCard({ title, children }) {
  return (
    <div className="section-card">
      <h4>{title}</h4>
      <div>{children}</div>
    </div>
  );
}

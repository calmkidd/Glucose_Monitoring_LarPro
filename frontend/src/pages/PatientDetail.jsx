import { useParams } from "react-router-dom";
import { useState } from "react";
import { addChecklist } from "../api";

export default function PatientDetail() {
  const { id } = useParams();
  const [item, setItem] = useState("");

  const submit = (type) => {
    addChecklist(id, type, item);
    setItem("");
    alert("Checklist saved");
  };

  return (
    <div className="container">
      <h2>Patient Session</h2>

      <div className="card">
        <h3>Pre-HD Checklist</h3>
        <input
          placeholder="Checklist item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <button onClick={() => submit("pre")}>Save Pre-HD</button>
      </div>

      <div className="card">
        <h3>Post-HD Checklist</h3>
        <input
          placeholder="Checklist item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <button onClick={() => submit("post")}>Save Post-HD</button>
      </div>
    </div>
  );
}


import { useState, useEffect, useRef } from "react";

const CATEGORIES = {
  institutional: { label: "Institutional", bar: "#2d6be4", light: "#d6e4ff", text: "#1e3a5f" },
  iqe: { label: "Quality Engagement", bar: "#e4572d", light: "#ffd6c8", text: "#5f1e0a" },
  iqip: { label: "Quality Improvement", bar: "#2de48a", light: "#c8ffe3", text: "#0a5f2e" },
  iqaa: { label: "Quality Assurance & Accountability", bar: "#e4c42d", light: "#fff8c8", text: "#5f4a0a" },
  km: { label: "Knowledge Management", bar: "#9c2de4", light: "#ead6ff", text: "#3a1e5f" },
  fe: { label: "Faculty Engagement", bar: "#2dc4e4", light: "#c8f4ff", text: "#0a3f5f" },
  ipe: { label: "Institutional Policy Engagement", bar: "#e42d7a", light: "#ffd6eb", text: "#5f0a2e" },
  qmdse: { label: "QMD Strategic Engagement", bar: "#e47a2d", light: "#ffe3c8", text: "#5f2e0a" },
  iqc: { label: "Institutional Quality Culture", bar: "#2de4c4", light: "#c8fff4", text: "#0a5f4a" }
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri"];

function getWorkdaysInYear(year) {
  const days = [];
  const d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    const dow = d.getDay();
    if (dow >= 1 && dow <= 5) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function dateToWorkdayIndex(date, days) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < days.length; i++) {
    const dd = new Date(days[i]);
    dd.setHours(0, 0, 0, 0);
    if (dd >= d) return i;
  }
  return days.length - 1;
}

function getMonthGroups(days) {
  const groups = [];
  let lastMonth = -1, startIdx = 0;

  days.forEach((d, i) => {
    const m = d.getMonth();
    if (m !== lastMonth) {
      if (lastMonth !== -1) {
        groups.push({ month: lastMonth, startIdx, count: i - startIdx });
      }
      lastMonth = m;
      startIdx = i;
    }
  });

  if (lastMonth !== -1) {
    groups.push({ month: lastMonth, startIdx, count: days.length - startIdx });
  }

  return groups;
}

const defaultActivities = [
  { id: 1, name: "Annual Review", type: "institutional", start: "2026-02-02", end: "2026-02-27", description: "Institutional annual performance review" },
  { id: 2, name: "DQIP Cycle 1", type: "iqip", start: "2026-03-02", end: "2026-03-30", description: "Quality improvement cycle 1" },
  { id: 3, name: "Staff Knowledge Session", type: "km", start: "2026-05-04", end: "2026-05-29", description: "Knowledge management session" },
  { id: 4, name: "Faculty Workshop Q2", type: "fe", start: "2026-06-01", end: "2026-07-15", description: "Faculty engagement workshop" }
];

export default function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [activities, setActivities] = useState(() => {
    try {
      const stored = localStorage.getItem("qmd_activities_v3");
      return stored ? JSON.parse(stored) : defaultActivities;
    } catch {
      return defaultActivities;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");
  
  useEffect(() => {
    localStorage.setItem("qmd_activities_v3", JSON.stringify(activities));
  }, [activities]);

  const days = getWorkdaysInYear(year);
  const DAY_W = 28;

  function openAdd() {
    setFormError("");
    setShowModal(true);
  }

  const css = `
    body {
      margin: 0;
      background: #0d1117;
      color: #e6edf3;
      font-family: Arial, sans-serif;
    }
  `;

  return (
    <div>
      <style>{css}</style>

      <h1 style={{ padding: 20 }}>✅ QMD Schedule (Fixed)</h1>

      <button onClick={openAdd} style={{ margin: 20 }}>
        + Add Activity
      </button>

      <div style={{ padding: 20 }}>
        Total activities: {activities.length}
      </div>

      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#161b22",
            padding: 20,
            borderRadius: 10
          }}>
            <h2>Add Activity</h2>

            {formError && <div style={{ color: "red" }}>{formError}</div>}

            <button onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

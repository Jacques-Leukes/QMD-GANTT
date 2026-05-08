import { useState, useMemo } from "react";

const DAY_W = 24;
const ROW_H = 44;

const CATEGORIES = {
  institutional: { label: "Institutional", color: "#2d6be4" },
  iqe: { label: "Institutional Quality Engagement", color: "#e4572d" },
  iqip: { label: "Institutional Quality Improvement", color: "#2de48a" },
  iqaa: { label: "Institutional Quality Assurance & Accountability", color: "#e4c42d" },
  km: { label: "Knowledge Management", color: "#9c2de4" },
  fe: { label: "Faculty Engagement", color: "#2dc4e4" },
  ipe: { label: "Institutional Policy Engagement", color: "#e42d7a" },
  qmdse: { label: "QMD Strategic Engagement", color: "#e47a2d" },
  iqc: { label: "Institutional Quality Culture", color: "#2de4c4" }
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const defaultData = [
  { id: 1, name: "Annual Review", type: "institutional", start: "2026-02-02", end: "2026-02-27" },
  { id: 2, name: "Engagement Project", type: "iqe", start: "2026-03-01", end: "2026-04-15" },
  { id: 3, name: "DQIP Cycle", type: "iqip", start: "2026-03-10", end: "2026-04-30" },
  { id: 4, name: "QA Audit", type: "iqaa", start: "2026-05-01", end: "2026-05-20" },
  { id: 5, name: "Knowledge Session", type: "km", start: "2026-05-10", end: "2026-05-30" },
  { id: 6, name: "Faculty Workshop", type: "fe", start: "2026-06-01", end: "2026-07-10" },
  { id: 7, name: "Policy Engagement", type: "ipe", start: "2026-07-01", end: "2026-07-20" },
  { id: 8, name: "QMD Strategy", type: "qmdse", start: "2026-08-01", end: "2026-08-25" },
  { id: 9, name: "Culture Program", type: "iqc", start: "2026-09-01", end: "2026-09-30" }
];

function getDays(year) {
  const days = [];
  let d = new Date(year, 0, 1);
  while (d.getFullYear() === year) {
    if (d.getDay() >= 1 && d.getDay() <= 5) {
      days.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getIndex(date, days) {
  const target = new Date(date).setHours(0,0,0,0);
  return days.findIndex(d => d.setHours(0,0,0,0) >= target);
}

export default function App() {
  const year = 2026;
  const days = useMemo(() => getDays(year), [year]);
  const totalW = days.length * DAY_W;

  const [filter, setFilter] = useState("all");
  const data = defaultData.filter(a => filter === "all" || a.type === filter);

  return (
    <div style={{ background:"#0d1117", color:"#fff", minHeight:"100vh", fontFamily:"Segoe UI" }}>

      {/* HEADER */}
      <div style={{ padding:20 }}>
        <h1>✅ QMD Advanced Gantt</h1>

        {/* FILTERS */}
        <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:6 }}>
          <button onClick={() => setFilter("all")}>All</button>
          {Object.keys(CATEGORIES).map(k => (
            <button key={k} onClick={() => setFilter(k)}>
              {CATEGORIES[k].label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"flex" }}>

        {/* LEFT PANEL */}
        <div style={{ width:260 }}>
          {data.map(a => (
            <div key={a.id} style={{
              height:ROW_H,
              borderBottom:"1px solid #30363d",
              padding:"8px"
            }}>
              <div style={{ fontWeight:600 }}>{a.name}</div>
              <div style={{ fontSize:10, color:"#8b949e" }}>
                {CATEGORIES[a.type].label}
              </div>
            </div>
          ))}
        </div>

        {/* GANTT */}
        <div style={{ overflowX:"auto", flex:1 }}>
          <div style={{ width: totalW, position:"relative" }}>

            {/* MONTH HEADER */}
            {MONTHS.map((m,i) => (
              <div key={i} style={{
                position:"absolute",
                left:i*20*DAY_W,
                width:20*DAY_W,
                top:0,
                height:30,
                fontSize:12,
                color:"#8b949e",
                borderRight:"1px solid #30363d"
              }}>
                {m}
              </div>
            ))}

            {/* GRID */}
            {days.map((d,i) => (
              <div key={i} style={{
                position:"absolute",
                left:i*DAY_W,
                top:30,
                bottom:0,
                width:1,
                background:"#222"
              }} />
            ))}

            {/* BARS */}
            {data.map((a,row) => {
              const start = getIndex(a.start, days);
              const end = getIndex(a.end, days);

              return (
                <div key={a.id} style={{
                  position:"absolute",
                  top: row*ROW_H + 30,
                  left: start * DAY_W,
                  width: (end-start+1)*DAY_W,
                  height: 24,
                  background: CATEGORIES[a.type].color,
                  borderRadius:6
                }}
                title={`${a.name} (${a.start} → ${a.end})`}
                />
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
``

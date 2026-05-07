import { useState, useEffect, useRef } from “react”;

const CATEGORIES = {
institutional: {
label: “Institutional”,
bar: “#2d6be4”,
light: “#d6e4ff”,
text: “#1e3a5f”,
},
iqe: {
label: “Quality Engagement”,
bar: “#e4572d”,
light: “#ffd6c8”,
text: “#5f1e0a”,
},
iqip: {
label: “Quality Improvement”,
bar: “#2de48a”,
light: “#c8ffe3”,
text: “#0a5f2e”,
},
iqaa: {
label: “Quality Assurance & Accountability”,
bar: “#e4c42d”,
light: “#fff8c8”,
text: “#5f4a0a”,
},
km: {
label: “Knowledge Management”,
bar: “#9c2de4”,
light: “#ead6ff”,
text: “#3a1e5f”,
},
fe: {
label: “Faculty Engagement”,
bar: “#2dc4e4”,
light: “#c8f4ff”,
text: “#0a3f5f”,
},
ipe: {
label: “Institutional Policy Engagement”,
bar: “#e42d7a”,
light: “#ffd6eb”,
text: “#5f0a2e”,
},
qmdse: {
label: “QMD Strategic Engagement”,
bar: “#e47a2d”,
light: “#ffe3c8”,
text: “#5f2e0a”,
},
iqc: {
label: “Institutional Quality Culture”,
bar: “#2de4c4”,
light: “#c8fff4”,
text: “#0a5f4a”,
},
};

const MONTHS = [“Jan”,“Feb”,“Mar”,“Apr”,“May”,“Jun”,“Jul”,“Aug”,“Sep”,“Oct”,“Nov”,“Dec”];

function getWeeksInYear(year) {
const weeks = [];
const jan1 = new Date(year, 0, 1);
const startDay = jan1.getDay();
let d = new Date(jan1);
d.setDate(d.getDate() - startDay);
while (true) {
if (d.getFullYear() > year && d.getMonth() > 0) break;
if (d <= new Date(year, 11, 31)) weeks.push(new Date(d));
d.setDate(d.getDate() + 7);
if (weeks.length > 54) break;
}
return weeks;
}

function dateToWeekIndex(date, weeks) {
const d = new Date(date);
for (let i = 0; i < weeks.length; i++) {
const weekEnd = new Date(weeks[i]);
weekEnd.setDate(weekEnd.getDate() + 6);
if (d >= weeks[i] && d <= weekEnd) return i;
}
if (d < weeks[0]) return 0;
return weeks.length - 1;
}

const defaultActivities = [
{ id: 1, name: “Annual Review”, type: “institutional”, start: “2026-02-01”, end: “2026-02-28”, description: “Institutional annual performance review” },
{ id: 2, name: “DQIP Cycle 1”, type: “iqip”, start: “2026-03-01”, end: “2026-03-30”, description: “Quality improvement cycle 1” },
{ id: 3, name: “Staff Knowledge Session”, type: “km”, start: “2026-05-01”, end: “2026-05-31”, description: “Knowledge management session” },
{ id: 4, name: “Faculty Workshop Q2”, type: “fe”, start: “2026-06-01”, end: “2026-07-15”, description: “Faculty engagement workshop” },
];

export default function App() {
const [year, setYear] = useState(new Date().getFullYear());
const [activities, setActivities] = useState(() => {
try {
const stored = localStorage.getItem(“qmd_activities_v2”);
return stored ? JSON.parse(stored) : defaultActivities;
} catch { return defaultActivities; }
});
const [showModal, setShowModal] = useState(false);
const [editActivity, setEditActivity] = useState(null);
const [filterType, setFilterType] = useState(“all”);
const [hoveredId, setHoveredId] = useState(null);
const [tooltip, setTooltip] = useState(null);
const [form, setForm] = useState({ name: “”, type: “institutional”, start: “”, end: “”, description: “” });
const [formError, setFormError] = useState(””);
const [deleteConfirm, setDeleteConfirm] = useState(null);
const weeks = getWeeksInYear(year);
const scrollRef = useRef(null);

useEffect(() => {
try { localStorage.setItem(“qmd_activities_v2”, JSON.stringify(activities)); } catch {}
}, [activities]);

const filteredActivities = activities.filter(a => {
if (filterType !== “all” && a.type !== filterType) return false;
const s = new Date(a.start), e = new Date(a.end);
return s.getFullYear() === year || e.getFullYear() === year ||
(s.getFullYear() < year && e.getFullYear() > year);
});

const monthGroups = [];
let lastMonth = -1, startIdx = 0;
weeks.forEach((w, i) => {
const m = w.getMonth();
if (m !== lastMonth) {
if (lastMonth !== -1) monthGroups.push({ month: lastMonth, startIdx, count: i - startIdx });
lastMonth = m;
startIdx = i;
}
});
if (lastMonth !== -1) monthGroups.push({ month: lastMonth, startIdx, count: weeks.length - startIdx });

const WEEK_W = 36;
const ROW_H = 44;
const LABEL_W = 240;

function openAdd() {
setForm({ name: “”, type: “institutional”, start: `${year}-01-01`, end: `${year}-01-31`, description: “” });
setEditActivity(null);
setFormError(””);
setShowModal(true);
}

function openEdit(a) {
setForm({ name: a.name, type: a.type, start: a.start, end: a.end, description: a.description || “” });
setEditActivity(a);
setFormError(””);
setShowModal(true);
}

function saveActivity() {
if (!form.name.trim()) { setFormError(“Activity name is required.”); return; }
if (!form.start || !form.end) { setFormError(“Start and end dates are required.”); return; }
if (new Date(form.start) > new Date(form.end)) { setFormError(“Start date must be before end date.”); return; }
if (editActivity) {
setActivities(prev => prev.map(a => a.id === editActivity.id ? { …a, …form } : a));
} else {
setActivities(prev => […prev, { …form, id: Date.now() }]);
}
setShowModal(false);
}

function deleteActivity(id) {
setActivities(prev => prev.filter(a => a.id !== id));
setDeleteConfirm(null);
}

const totalW = weeks.length * WEEK_W;

function syncScroll(e) {
if (scrollRef.current) scrollRef.current.scrollLeft = e.target.scrollLeft;
}

const categoryKeys = Object.keys(CATEGORIES);

return (
<div style={{ fontFamily: “‘DM Sans’, ‘Segoe UI’, sans-serif”, minHeight: “100vh”, background: “#0d1117”, color: “#e6edf3” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { height: 6px; width: 6px; } ::-webkit-scrollbar-track { background: #161b22; } ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; } .act-row:hover { background: #161b22 !important; } .btn-primary { background: linear-gradient(135deg,#2d6be4,#7c3aed); color:#fff; border:none; padding:9px 20px; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; transition:opacity .2s; } .btn-primary:hover { opacity:.85; } .btn-ghost { background: transparent; color:#8b949e; border:1px solid #30363d; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:13px; transition:all .2s; } .btn-ghost:hover { border-color:#58a6ff; color:#58a6ff; } .filter-btn { background:transparent; border:1px solid #30363d; color:#8b949e; padding:5px 12px; border-radius:20px; cursor:pointer; font-size:11px; font-weight:500; transition:all .15s; white-space:nowrap; } .filter-btn.active { color:#fff; } input, textarea, select { background:#161b22; border:1px solid #30363d; color:#e6edf3; border-radius:8px; padding:9px 12px; font-size:14px; width:100%; outline:none; font-family:inherit; transition:border .2s; } input:focus, textarea:focus, select:focus { border-color:#2d6be4; } label { display:block; font-size:12px; font-weight:600; color:#8b949e; margin-bottom:5px; text-transform:uppercase; letter-spacing:.5px; } .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(4px); } .modal { background:#161b22; border:1px solid #30363d; border-radius:16px; padding:28px; width:min(540px,95vw); max-height:90vh; overflow-y:auto; } .gantt-bar { height:22px; border-radius:5px; cursor:pointer; position:absolute; top:11px; transition:filter .15s,transform .1s; } .gantt-bar:hover { filter:brightness(1.2); transform:scaleY(1.1); } .filter-wrap { display:flex; flex-wrap:wrap; gap:6px; }`}</style>

```
  {/* Header */}
  <div style={{ background: "linear-gradient(135deg,#0d1117 0%,#1a1f2e 100%)", borderBottom: "1px solid #21262d", padding: "18px 28px 14px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#2d6be4,#7c3aed)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>Q</div>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>QMD Schedule</h1>
          <p style={{ fontSize: 12, color: "#8b949e", marginTop: 1 }}>Gantt Chart — Activity Planner</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#21262d", borderRadius: 8, padding: "4px 10px" }}>
          <button onClick={() => setYear(y => y - 1)} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>‹</button>
          <span style={{ fontWeight: 700, fontSize: 15, minWidth: 40, textAlign: "center" }}>{year}</span>
          <button onClick={() => setYear(y => y + 1)} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>›</button>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Activity</button>
      </div>
    </div>

    {/* Filter buttons */}
    <div style={{ marginTop: 12 }}>
      <div className="filter-wrap">
        <button
          className={`filter-btn${filterType === "all" ? " active" : ""}`}
          style={filterType === "all" ? { background: "#21262d", borderColor: "#58a6ff", color: "#58a6ff" } : {}}
          onClick={() => setFilterType("all")}
        >
          All Activities
        </button>
        {categoryKeys.map(key => {
          const cat = CATEGORIES[key];
          const isActive = filterType === key;
          return (
            <button
              key={key}
              className={`filter-btn${isActive ? " active" : ""}`}
              style={isActive ? { background: cat.bar + "33", borderColor: cat.bar, color: cat.bar } : {}}
              onClick={() => setFilterType(key)}
            >
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: cat.bar, marginRight: 5, verticalAlign: "middle" }}></span>
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  </div>

  {/* Stats */}
  <div style={{ display: "flex", borderBottom: "1px solid #30363d", overflowX: "auto" }}>
    {[
      { label: "Total Activities", val: activities.length, color: "#e6edf3" },
      { label: `Active in ${year}`, val: filteredActivities.length, color: "#58a6ff" },
      ...categoryKeys.map(k => ({
        label: CATEGORIES[k].label,
        val: activities.filter(a => a.type === k).length,
        color: CATEGORIES[k].bar,
      }))
    ].map((s, i) => (
      <div key={i} style={{ flexShrink: 0, padding: "10px 18px", textAlign: "center", background: "#0d1117", borderRight: "1px solid #21262d", minWidth: 100 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
        <div style={{ fontSize: 10, color: "#8b949e", marginTop: 2, maxWidth: 120 }}>{s.label}</div>
      </div>
    ))}
  </div>

  {/* Main */}
  <div style={{ display: "flex", height: "calc(100vh - 210px)", minHeight: 300 }}>
    {/* Sidebar */}
    <div style={{ width: LABEL_W, flexShrink: 0, borderRight: "1px solid #21262d", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px 14px", background: "#161b22", borderBottom: "1px solid #21262d", fontSize: 11, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1 }}>
        Activity
      </div>
      <div style={{ height: 48, background: "#0d1117", borderBottom: "2px solid #21262d", flexShrink: 0 }}></div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {filteredActivities.length === 0 && (
          <div style={{ padding: 24, color: "#8b949e", fontSize: 13, textAlign: "center" }}>No activities found.<br />Click "+ Add Activity" to get started.</div>
        )}
        {filteredActivities.map(a => {
          const cat = CATEGORIES[a.type] || CATEGORIES.institutional;
          return (
            <div key={a.id} className="act-row" style={{ display: "flex", alignItems: "center", height: ROW_H, padding: "0 12px", borderBottom: "1px solid #21262d", background: hoveredId === a.id ? "#161b22" : "#0d1117", cursor: "pointer", gap: 8 }}
              onMouseEnter={() => setHoveredId(a.id)} onMouseLeave={() => setHoveredId(null)}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.bar, flexShrink: 0 }}></div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                <div style={{ fontSize: 10, color: "#8b949e", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat.label}</div>
              </div>
              <div style={{ display: "flex", gap: 4, opacity: hoveredId === a.id ? 1 : 0, transition: "opacity .15s" }}>
                <button onClick={() => openEdit(a)} style={{ background: "none", border: "none", color: "#58a6ff", cursor: "pointer", fontSize: 13, padding: 2 }} title="Edit">✏</button>
                <button onClick={() => setDeleteConfirm(a.id)} style={{ background: "none", border: "none", color: "#f85149", cursor: "pointer", fontSize: 13, padding: 2 }} title="Delete">✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Gantt */}
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ overflowX: "hidden", flexShrink: 0 }} ref={scrollRef}>
        <div style={{ width: totalW, background: "#161b22", borderBottom: "1px solid #21262d", display: "flex", position: "relative", height: 28 }}>
          {monthGroups.map(({ month, startIdx: si, count }) => (
            <div key={month} style={{ position: "absolute", left: si * WEEK_W, width: count * WEEK_W, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #21262d", fontSize: 11, fontWeight: 700, color: "#8b949e", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {MONTHS[month]}
            </div>
          ))}
        </div>
        <div style={{ width: totalW, background: "#0d1117", borderBottom: "2px solid #21262d", display: "flex" }}>
          {weeks.map((w, i) => {
            const isToday = w <= new Date() && new Date() < new Date(w.getTime() + 7 * 86400000);
            const day = w.getDate();
            const mon = MONTHS[w.getMonth()];
            return (
              <div key={i} style={{ width: WEEK_W, flexShrink: 0, height: 20, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #21262d", fontSize: 9, color: isToday ? "#2d6be4" : "#484f58", fontWeight: isToday ? 700 : 400, background: isToday ? "#1a2744" : "transparent" }}>
                {day} {mon}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "scroll" }} onScroll={syncScroll}>
        <div style={{ width: totalW, minHeight: "100%", position: "relative" }}>
          {weeks.map((w, i) => {
            const isToday = w <= new Date() && new Date() < new Date(w.getTime() + 7 * 86400000);
            return <div key={i} style={{ position: "absolute", left: i * WEEK_W, top: 0, bottom: 0, width: 1, background: isToday ? "#2d6be4" : "#21262d", zIndex: 0 }}></div>;
          })}
          {(() => {
            const now = new Date();
            const idx = dateToWeekIndex(now, weeks);
            const dayInWeek = (now.getDay() || 7) - 1;
            const x = idx * WEEK_W + (dayInWeek / 7) * WEEK_W;
            return <div style={{ position: "absolute", left: x, top: 0, bottom: 0, width: 2, background: "#2d6be4", opacity: .7, zIndex: 5 }}><div style={{ position: "absolute", top: 0, left: -18, background: "#2d6be4", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3, whiteSpace: "nowrap" }}>TODAY</div></div>;
          })()}
          {filteredActivities.length === 0 && (
            <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", color: "#8b949e", fontSize: 14, textAlign: "center" }}>No activities to display</div>
          )}
          {filteredActivities.map(a => {
            const cat = CATEGORIES[a.type] || CATEGORIES.institutional;
            const startW = dateToWeekIndex(new Date(a.start), weeks);
            const endW = dateToWeekIndex(new Date(a.end), weeks);
            const barLeft = startW * WEEK_W;
            const barW = Math.max((endW - startW + 1) * WEEK_W - 2, WEEK_W - 2);
            return (
              <div key={a.id} style={{ position: "relative", height: ROW_H, borderBottom: "1px solid #21262d", background: hoveredId === a.id ? "#161b22" : "transparent" }}
                onMouseEnter={() => setHoveredId(a.id)} onMouseLeave={() => setHoveredId(null)}>
                <div className="gantt-bar"
                  style={{ left: barLeft, width: barW, background: `linear-gradient(90deg,${cat.bar},${cat.bar}bb)`, boxShadow: `0 2px 8px ${cat.bar}44` }}
                  onMouseMove={ev => setTooltip({ id: a.id, x: ev.clientX, y: ev.clientY, a })}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => openEdit(a)}
                >
                  <span style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: barW - 12, lineHeight: 1 }}>{a.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>

  {/* Tooltip */}
  {tooltip && (
    <div style={{ position: "fixed", left: tooltip.x + 12, top: tooltip.y - 10, background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: "10px 14px", zIndex: 999, pointerEvents: "none", minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,.6)" }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>{tooltip.a.name}</div>
      {(() => {
        const cat = CATEGORIES[tooltip.a.type] || CATEGORIES.institutional;
        return <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: cat.light, color: cat.text, marginBottom: 6 }}>{cat.label}</div>;
      })()}
      <div style={{ fontSize: 11, color: "#8b949e" }}>📅 {tooltip.a.start} → {tooltip.a.end}</div>
      {tooltip.a.description && <div style={{ fontSize: 11, color: "#8b949e", marginTop: 4, maxWidth: 240 }}>{tooltip.a.description}</div>}
    </div>
  )}

  {/* Add/Edit Modal */}
  {showModal && (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
      <div className="modal">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700 }}>{editActivity ? "Edit Activity" : "Add Activity"}</h2>
          <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {formError && <div style={{ background: "#3d1a1a", border: "1px solid #f85149", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#f85149" }}>{formError}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label>Activity Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. DQIP Cycle 1, Staff Meeting" />
          </div>
          <div>
            <label>Portfolio / Category *</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {categoryKeys.map(key => (
                <option key={key} value={key}>{CATEGORIES[key].label}</option>
              ))}
            </select>
            {/* Colour preview */}
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: CATEGORIES[form.type]?.bar || "#2d6be4" }}></div>
              <span style={{ fontSize: 12, color: "#8b949e" }}>{CATEGORIES[form.type]?.label}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Start Date *</label>
              <input type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} />
            </div>
            <div>
              <label>End Date *</label>
              <input type="date" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} />
            </div>
          </div>
          <div>
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Optional notes about this activity..." style={{ resize: "vertical" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={saveActivity}>{editActivity ? "Save Changes" : "Add Activity"}</button>
        </div>
      </div>
    </div>
  )}

  {/* Delete confirm */}
  {deleteConfirm && (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Delete Activity?</h2>
        <p style={{ fontSize: 13, color: "#8b949e", marginBottom: 20 }}>This action cannot be undone.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
          <button style={{ background: "#3d1a1a", border: "1px solid #f85149", color: "#f85149", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }} onClick={() => deleteActivity(deleteConfirm)}>Delete</button>
        </div>
      </div>
    </div>
  )}
</div>
```

);
}
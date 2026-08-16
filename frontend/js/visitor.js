// Visitor dashboard logic.
// Tracks which exhibitions this visitor has saved/registered for,
// pulling exhibition details from the same demoExhibitions data
// the organizer and exhibitor sides use.

const EXHIBITIONS_KEY = "demoExhibitions";
const VISITOR_SAVED_KEY = "demoVisitorSaved";

const FALLBACK_EXHIBITIONS = [
  { id: 1, title: "TechXpo Indore 2026", venue: "Brilliant Convention Centre", start_date: "2026-08-14", end_date: "2026-08-16", status: "upcoming" },
  { id: 2, title: "National Textile Fair", venue: "Exhibition Grounds, Bhopal", start_date: "2026-07-01", end_date: "2026-07-04", status: "ongoing" },
  { id: 3, title: "AutoParts Expo", venue: "Trade Centre, Pithampur", start_date: "2026-05-10", end_date: "2026-05-12", status: "completed" },
];

function getAllExhibitions() {
  const stored = localStorage.getItem(EXHIBITIONS_KEY);
  return stored ? JSON.parse(stored) : FALLBACK_EXHIBITIONS;
}

function getSavedIds() {
  const stored = localStorage.getItem(VISITOR_SAVED_KEY);
  if (stored) return JSON.parse(stored);
  const defaultSaved = [1, 3];
  localStorage.setItem(VISITOR_SAVED_KEY, JSON.stringify(defaultSaved));
  return defaultSaved;
}

function loadVisitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Visitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return `${s} – ${e}`;
}

function renderStats() {
  const savedIds = getSavedIds();
  const all = getAllExhibitions();
  const saved = all.filter(ex => savedIds.includes(ex.id));
  const attended = saved.filter(ex => ex.status === "completed");

  document.getElementById("statSaved").textContent = saved.length;
  document.getElementById("statAttended").textContent = attended.length;
  document.getElementById("statBooths").textContent = "14";
}

function renderMyExhibitions() {
  const tbody = document.getElementById("myExhibitionsBody");
  const savedIds = getSavedIds();
  const all = getAllExhibitions();
  const saved = all.filter(ex => savedIds.includes(ex.id));

  if (!saved.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">You haven't saved any exhibitions yet. Browse and save a few to see them here.</td></tr>`;
    return;
  }

  tbody.innerHTML = saved.map(ex => `
    <tr>
      <td>${ex.title}</td>
      <td>${ex.venue}</td>
      <td>${formatDateRange(ex.start_date, ex.end_date)}</td>
      <td><span class="badge ${ex.status}">${ex.status}</span></td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadVisitorUserChip();
  renderStats();
  renderMyExhibitions();
});
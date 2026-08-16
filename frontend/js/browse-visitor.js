// Browse Exhibitions page (visitor side).
// Shows all exhibitions (any status) with a Save/Saved toggle button.

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

function saveSavedIds(ids) {
  localStorage.setItem(VISITOR_SAVED_KEY, JSON.stringify(ids));
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

function toggleSave(id) {
  let saved = getSavedIds();
  if (saved.includes(id)) {
    saved = saved.filter(x => x !== id);
  } else {
    saved.push(id);
  }
  saveSavedIds(saved);
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("exhibitionsGrid");
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const statusTerm = document.getElementById("statusFilter").value;
  const savedIds = getSavedIds();

  let list = getAllExhibitions();
  if (searchTerm) {
    list = list.filter(ex => ex.title.toLowerCase().includes(searchTerm) || ex.venue.toLowerCase().includes(searchTerm));
  }
  if (statusTerm) list = list.filter(ex => ex.status === statusTerm);

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No exhibitions match your search.</div>`;
    return;
  }

  grid.innerHTML = list.map(ex => {
    const isSaved = savedIds.includes(ex.id);
    return `
      <div class="role-card visitor">
        <div class="tag">${ex.status}</div>
        <h4>${ex.title}</h4>
        <p>${ex.venue}<br>${formatDateRange(ex.start_date, ex.end_date)}</p>
        <button class="btn ${isSaved ? "btn-ghost-light" : "btn-copper"}" style="width:100%; text-align:center;" onclick="toggleSave(${ex.id})">
          ${isSaved ? "★ Saved" : "☆ Save"}
        </button>
        <a href="exhibition-detail.html?id=${ex.id}" style="display:block; text-align:center; margin-top:10px; font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--copper); text-decoration:none;">View details →</a>
      </div>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadVisitorUserChip();
  renderGrid();
  document.getElementById("searchInput").addEventListener("input", renderGrid);
  document.getElementById("statusFilter").addEventListener("change", renderGrid);
});
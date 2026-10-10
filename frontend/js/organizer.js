// Organizer dashboard logic.
// Uses demo/mock data for now so the UI is fully testable before
// the real backend endpoints (GET /api/organizer/*) are wired in.

function loadUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Organizer";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

const DEMO_EXHIBITIONS = [
  {
    title: "TechXpo Indore 2026",
    venue: "Brilliant Convention Centre",
    start: "2026-08-14",
    end: "2026-08-16",
    exhibitors: 42,
    status: "upcoming",
  },
  {
    title: "National Textile Fair",
    venue: "Exhibition Grounds, Bhopal",
    start: "2026-07-01",
    end: "2026-07-04",
    exhibitors: 78,
    status: "ongoing",
  },
  {
    title: "AutoParts Expo",
    venue: "Trade Centre, Pithampur",
    start: "2026-05-10",
    end: "2026-05-12",
    exhibitors: 55,
    status: "completed",
  },
  {
    title: "Future Foods Summit",
    venue: "Grand Hall, Indore",
    start: "2026-09-20",
    end: "2026-09-22",
    exhibitors: 12,
    status: "draft",
  },
];

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return `${s} – ${e}`;
}

function renderStats() {
  const totalExhibitions = DEMO_EXHIBITIONS.length;
  const totalExhibitors = DEMO_EXHIBITIONS.reduce((sum, ex) => sum + ex.exhibitors, 0);

  document.getElementById("statExhibitions").textContent = totalExhibitions;
  document.getElementById("statExhibitors").textContent = totalExhibitors;
  document.getElementById("statVisitors").textContent = "1,240";
  document.getElementById("statPending").textContent = "6";
}

function renderExhibitionsTable() {
  const tbody = document.getElementById("exhibitionsBody");

  if (!DEMO_EXHIBITIONS.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No exhibitions yet. Create your first one.</td></tr>`;
    return;
  }

  tbody.innerHTML = DEMO_EXHIBITIONS.map((ex) => `
    <tr>
      <td>${ex.title}</td>
      <td>${ex.venue}</td>
      <td>${formatDateRange(ex.start, ex.end)}</td>
      <td>${ex.exhibitors}</td>
      <td><span class="badge ${ex.status}">${ex.status}</span></td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserChip();
  renderStats();
  renderExhibitionsTable();
});
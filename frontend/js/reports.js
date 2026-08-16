// Reports page logic.
// Aggregates demo data across exhibitions, visitor logs, leads, and feedback.
// Once real endpoints exist, replace SEED_REPORTS with a fetch to
// something like GET /api/organizer/reports.

const SEED_REPORTS = [
  { exhibition_title: "TechXpo Indore 2026", visitors: 480, leads: 96, avg_rating: 4.3, booths_occupied: "18/24" },
  { exhibition_title: "National Textile Fair", visitors: 610, leads: 142, avg_rating: 4.1, booths_occupied: "20/20" },
  { exhibition_title: "AutoParts Expo", visitors: 150, leads: 38, avg_rating: 3.8, booths_occupied: "12/15" },
];

function loadUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Organizer";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function renderStats() {
  const totalVisitors = SEED_REPORTS.reduce((sum, r) => sum + r.visitors, 0);
  const totalLeads = SEED_REPORTS.reduce((sum, r) => sum + r.leads, 0);
  const avgRating = (SEED_REPORTS.reduce((sum, r) => sum + r.avg_rating, 0) / SEED_REPORTS.length).toFixed(1);

  document.getElementById("statFootfall").textContent = totalVisitors.toLocaleString("en-IN");
  document.getElementById("statLeads").textContent = totalLeads.toLocaleString("en-IN");
  document.getElementById("statRating").textContent = `${avgRating} / 5`;
  document.getElementById("statOccupied").textContent = "50/59";
}

function renderTable() {
  const tbody = document.getElementById("reportsBody");
  tbody.innerHTML = SEED_REPORTS.map(r => `
    <tr>
      <td>${r.exhibition_title}</td>
      <td>${r.visitors.toLocaleString("en-IN")}</td>
      <td>${r.leads}</td>
      <td>${r.avg_rating} / 5</td>
      <td>${r.booths_occupied}</td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserChip();
  renderStats();
  renderTable();

  document.getElementById("exportBtn").addEventListener("click", () => {
    alert("PDF export will be wired up once the backend report-generation endpoint is ready.");
  });
});
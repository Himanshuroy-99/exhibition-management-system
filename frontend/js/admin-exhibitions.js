// Admin > All Exhibitions.
// Real version: GET /api/admin/exhibitions — joins exhibitions with the
// organizers table so every row shows who created it, regardless of organizer.

const EXHIBITIONS_KEY = "demoExhibitions";

const FALLBACK_EXHIBITIONS = [
  { id: 1, title: "TechXpo Indore 2026", venue: "Brilliant Convention Centre", start_date: "2026-08-14", end_date: "2026-08-16", status: "upcoming", organizer_name: "Apex Expo Group" },
  { id: 2, title: "National Textile Fair", venue: "Exhibition Grounds, Bhopal", start_date: "2026-07-01", end_date: "2026-07-04", status: "ongoing", organizer_name: "Madhya Expo Council" },
  { id: 3, title: "AutoParts Expo", venue: "Trade Centre, Pithampur", start_date: "2026-05-10", end_date: "2026-05-12", status: "completed", organizer_name: "Apex Expo Group" },
  { id: 4, title: "Future Foods Summit", venue: "Grand Hall, Indore", start_date: "2026-09-20", end_date: "2026-09-22", status: "draft", organizer_name: "Apex Expo Group" },
];

function getExhibitions() {
  const stored = localStorage.getItem(EXHIBITIONS_KEY);
  const list = stored ? JSON.parse(stored) : FALLBACK_EXHIBITIONS;
  // demoExhibitions (written by the organizer side) doesn't carry an
  // organizer name in the demo data — fall back to a placeholder so the
  // admin table still reads sensibly until the backend joins this properly.
  return list.map(ex => ({ organizer_name: "Apex Expo Group", ...ex }));
}

function saveExhibitions(list) {
  localStorage.setItem(EXHIBITIONS_KEY, JSON.stringify(list));
}

function loadAdminUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Admin";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return `${s} – ${e}`;
}

function renderTable() {
  const tbody = document.getElementById("allExhibitionsBody");
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const statusTerm = document.getElementById("statusFilter").value;

  let list = getExhibitions();
  if (searchTerm) {
    list = list.filter(ex =>
      ex.title.toLowerCase().includes(searchTerm) ||
      ex.venue.toLowerCase().includes(searchTerm) ||
      ex.organizer_name.toLowerCase().includes(searchTerm)
    );
  }
  if (statusTerm) list = list.filter(ex => ex.status === statusTerm);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No exhibitions match your filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(ex => `
    <tr>
      <td>${ex.title}</td>
      <td>${ex.organizer_name}</td>
      <td>${ex.venue}</td>
      <td>${formatDateRange(ex.start_date, ex.end_date)}</td>
      <td><span class="badge ${ex.status}">${ex.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="danger" onclick="removeExhibition(${ex.id})">Remove</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function removeExhibition(id) {
  if (!confirm("Remove this exhibition from the platform? This affects the organizer's account too.")) return;
  const list = getExhibitions().filter(ex => ex.id !== id);
  saveExhibitions(list);
  renderTable();
}

document.addEventListener("DOMContentLoaded", () => {
  loadAdminUserChip();
  renderTable();
  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("statusFilter").addEventListener("change", renderTable);
});
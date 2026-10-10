// Browse Exhibitions page (exhibitor side).
// Reads exhibitions created on the organizer side (demoExhibitions) so the
// two roles share the same underlying demo data, same as a real DB would.

const EXHIBITIONS_KEY = "demoExhibitions";
const REGISTRATIONS_KEY = "demoExhibitorRegistrations";
const REQUESTS_KEY = "demoExhibitorRequests";

const FALLBACK_EXHIBITIONS = [
  { id: 1, title: "TechXpo Indore 2026", venue: "Brilliant Convention Centre", start_date: "2026-08-14", end_date: "2026-08-16", status: "upcoming" },
  { id: 2, title: "National Textile Fair", venue: "Exhibition Grounds, Bhopal", start_date: "2026-07-01", end_date: "2026-07-04", status: "ongoing" },
];

function getExhibitions() {
  const stored = localStorage.getItem(EXHIBITIONS_KEY);
  const list = stored ? JSON.parse(stored) : FALLBACK_EXHIBITIONS;
  // Exhibitors can only apply to exhibitions still open for registration.
  return list.filter(ex => ex.status === "upcoming" || ex.status === "ongoing");
}

function loadExhibitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.company_name || stored.name || "Exhibitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return `${s} – ${e}`;
}

let currentExhibitionForApply = null;

function renderGrid() {
  const grid = document.getElementById("exhibitionsGrid");
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const statusTerm = document.getElementById("statusFilter").value;

  let list = getExhibitions();
  if (searchTerm) {
    list = list.filter(ex => ex.title.toLowerCase().includes(searchTerm) || ex.venue.toLowerCase().includes(searchTerm));
  }
  if (statusTerm) list = list.filter(ex => ex.status === statusTerm);

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No open exhibitions match your search right now.</div>`;
    return;
  }

  grid.innerHTML = list.map(ex => `
    <div class="role-card organizer" style="border-top-color:var(--copper);">
      <div class="tag">${ex.status}</div>
      <h4>${ex.title}</h4>
      <p>${ex.venue}<br>${formatDateRange(ex.start_date, ex.end_date)}</p>
      <button class="btn btn-copper" style="width:100%; text-align:center;" onclick="openApplyModal(${ex.id}, '${ex.title.replace(/'/g, "\\'")}')">Register</button>
    </div>
  `).join("");
}

function openApplyModal(exhibitionId, title) {
  currentExhibitionForApply = { id: exhibitionId, title };
  document.getElementById("applyModalTitle").textContent = `Register — ${title}`;

  const boothSelect = document.getElementById("booth_choice");
  boothSelect.innerHTML = ["A-04", "A-09", "B-03", "B-06", "C-02"]
    .map(b => `<option value="${b}">${b}</option>`).join("");

  document.getElementById("applyModal").classList.add("active");
}

function closeApplyModal() {
  document.getElementById("applyModal").classList.remove("active");
  document.getElementById("applyForm").reset();
  document.getElementById("applyFormError").classList.remove("active");
  currentExhibitionForApply = null;
}

function initApplyModal() {
  document.getElementById("closeApplyModal").addEventListener("click", closeApplyModal);
  document.getElementById("cancelApply").addEventListener("click", closeApplyModal);
  document.getElementById("applyModal").addEventListener("click", (e) => {
    if (e.target.id === "applyModal") closeApplyModal();
  });

  document.getElementById("applyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentExhibitionForApply) return;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const user = JSON.parse(localStorage.getItem("demoUser") || "{}");
    const companyName = user.company_name || user.name || "Your Company";

    // Add to this exhibitor's own registration list (shown on their dashboard).
    const registrations = JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || "[]");
    registrations.unshift({
      id: Date.now(),
      exhibition_title: currentExhibitionForApply.title,
      booth_number: data.booth_choice,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
      leads: 0,
      status: "pending",
    });
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));

    // Add to the organizer's pending-requests list (so it shows up for approval).
    const requests = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
    requests.unshift({
      id: Date.now() + 1,
      company_name: companyName,
      business_role: data.business_role,
      exhibition_title: currentExhibitionForApply.title,
      booth_number: data.booth_choice,
      status: "pending",
    });
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

    closeApplyModal();
    alert("Application submitted! You'll see it as \"pending\" on your dashboard until the organizer approves it.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadExhibitorUserChip();
  renderGrid();
  initApplyModal();
  document.getElementById("searchInput").addEventListener("input", renderGrid);
  document.getElementById("statusFilter").addEventListener("change", renderGrid);
});
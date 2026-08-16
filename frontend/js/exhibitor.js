const EXHIBITOR_REGISTRATIONS_KEY = "demoExhibitorRegistrations";

const SEED_REGISTRATIONS = [
  { id: 1, exhibition_title: "TechXpo Indore 2026", booth_number: "A-04", start_date: "2026-08-14", end_date: "2026-08-16", leads: 12, status: "confirmed" },
  { id: 2, exhibition_title: "Future Foods Summit", booth_number: "C-02", start_date: "2026-09-20", end_date: "2026-09-22", leads: 0, status: "pending" },
];

function loadRegistrations() {
  const stored = localStorage.getItem(EXHIBITOR_REGISTRATIONS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(EXHIBITOR_REGISTRATIONS_KEY, JSON.stringify(SEED_REGISTRATIONS));
  return SEED_REGISTRATIONS;
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

function renderExhibitorStats() {
  const list = loadRegistrations();
  const confirmed = list.filter(r => r.status === "confirmed");
  const pending = list.filter(r => r.status === "pending");
  const totalLeads = list.reduce((sum, r) => sum + r.leads, 0);
  const products = JSON.parse(localStorage.getItem("demoProducts") || "[]");

  document.getElementById("statActive").textContent = confirmed.length;
  document.getElementById("statProducts").textContent = products.length || 6;
  document.getElementById("statLeads").textContent = totalLeads;
  document.getElementById("statPending").textContent = pending.length;
}

function renderRegistrationsTable() {
  const tbody = document.getElementById("registrationsBody");
  const list = loadRegistrations();

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">You haven't registered for any exhibitions yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td>${r.exhibition_title}</td>
      <td>${r.booth_number}</td>
      <td>${formatDateRange(r.start_date, r.end_date)}</td>
      <td>${r.leads}</td>
      <td><span class="badge ${r.status}">${r.status}</span></td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadExhibitorUserChip();
  renderExhibitorStats();
  renderRegistrationsTable();
});
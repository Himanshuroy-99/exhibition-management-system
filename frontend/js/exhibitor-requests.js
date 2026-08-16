// Exhibitor Requests page logic.
// Maps to the `exhibition_exhibitors` table — each row is one company's
// application to join one exhibition with a requested booth.

const REQUESTS_STORAGE_KEY = "demoExhibitorRequests";

const SEED_REQUESTS = [
  { id: 1, company_name: "Samsung Electronics", business_role: "manufacturer", exhibition_title: "TechXpo Indore 2026", booth_number: "A-04", status: "pending" },
  { id: 2, company_name: "GreenLeaf Textiles", business_role: "manufacturer", exhibition_title: "National Textile Fair", booth_number: "T-02", status: "confirmed" },
  { id: 3, company_name: "Rapid Auto Distributors", business_role: "distributor", exhibition_title: "AutoParts Expo", booth_number: "B-06", status: "pending" },
  { id: 4, company_name: "Urban Retail Co.", business_role: "retailer", exhibition_title: "TechXpo Indore 2026", booth_number: "A-09", status: "rejected" },
];

function loadRequests() {
  const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(SEED_REQUESTS));
  return SEED_REQUESTS;
}

function saveRequests(list) {
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(list));
}

function loadUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Organizer";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function businessRoleLabel(role) {
  const labels = {
    manufacturer: "Manufacturer",
    distributor: "Distributor / Wholesaler",
    retailer: "Retailer / Reseller",
    service_provider: "Service Provider",
    startup: "Startup",
    other: "Other",
  };
  return labels[role] || role;
}

function renderStats() {
  const list = loadRequests();
  document.getElementById("statPending").textContent = list.filter(r => r.status === "pending").length;
  document.getElementById("statConfirmed").textContent = list.filter(r => r.status === "confirmed").length;
  document.getElementById("statRejected").textContent = list.filter(r => r.status === "rejected").length;
}

function renderTable() {
  const tbody = document.getElementById("requestsBody");
  const statusTerm = document.getElementById("statusFilter").value;

  let list = loadRequests();
  if (statusTerm) list = list.filter(r => r.status === statusTerm);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No requests match this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td>${r.company_name}</td>
      <td>${businessRoleLabel(r.business_role)}</td>
      <td>${r.exhibition_title}</td>
      <td>${r.booth_number}</td>
      <td><span class="badge ${r.status}">${r.status}</span></td>
      <td>
        <div class="row-actions">
          ${r.status === "pending" ? `
            <a href="#" onclick="updateStatus(${r.id}, 'confirmed'); return false;">Approve</a>
            <button class="danger" onclick="updateStatus(${r.id}, 'rejected')">Reject</button>
          ` : `<span style="color:var(--ink-soft); font-size:12.5px;">No actions</span>`}
        </div>
      </td>
    </tr>
  `).join("");
}

function updateStatus(id, newStatus) {
  const list = loadRequests();
  const req = list.find(r => r.id === id);
  if (req) req.status = newStatus;
  saveRequests(list);
  renderStats();
  renderTable();
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserChip();
  renderStats();
  renderTable();
  document.getElementById("statusFilter").addEventListener("change", renderTable);
});
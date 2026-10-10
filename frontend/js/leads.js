// Leads page — visitors who showed interest at this exhibitor's booth.
// Maps to the `leads` table (visitor_id + exhibition_exhibitor_id + product_id).

const LEADS_KEY = "demoLeads";

const SEED_LEADS = [
  { id: 1, visitor_name: "Priya Sharma", interest_level: "high", product_name: "Smart Water Purifier", status: "new" },
  { id: 2, visitor_name: "Rahul Verma", interest_level: "medium", product_name: "Solar Charging Panel", status: "contacted" },
  { id: 3, visitor_name: "Anjali Mehta", interest_level: "high", product_name: "Smart Water Purifier", status: "qualified" },
  { id: 4, visitor_name: "Karan Patel", interest_level: "low", product_name: "Industrial Air Filter", status: "closed" },
];

function loadLeads() {
  const stored = localStorage.getItem(LEADS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(LEADS_KEY, JSON.stringify(SEED_LEADS));
  return SEED_LEADS;
}

function saveLeads(list) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(list));
}

function loadExhibitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.company_name || stored.name || "Exhibitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function renderStats() {
  const list = loadLeads();
  document.getElementById("statNew").textContent = list.filter(l => l.status === "new").length;
  document.getElementById("statContacted").textContent = list.filter(l => l.status === "contacted").length;
  document.getElementById("statQualified").textContent = list.filter(l => l.status === "qualified").length;
  document.getElementById("statClosed").textContent = list.filter(l => l.status === "closed").length;
}

function renderTable() {
  const tbody = document.getElementById("leadsBody");
  const statusTerm = document.getElementById("statusFilter").value;

  let list = loadLeads();
  if (statusTerm) list = list.filter(l => l.status === statusTerm);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No leads match this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(l => `
    <tr>
      <td>${l.visitor_name}</td>
      <td><span class="badge ${l.interest_level}">${l.interest_level}</span></td>
      <td>${l.product_name}</td>
      <td><span class="badge ${l.status}">${l.status}</span></td>
      <td>
        <select onchange="updateLeadStatus(${l.id}, this.value)" style="padding:6px 8px; font-size:12.5px; border:1px solid #C9D6E2; border-radius:2px;">
          <option value="new" ${l.status === "new" ? "selected" : ""}>New</option>
          <option value="contacted" ${l.status === "contacted" ? "selected" : ""}>Contacted</option>
          <option value="qualified" ${l.status === "qualified" ? "selected" : ""}>Qualified</option>
          <option value="closed" ${l.status === "closed" ? "selected" : ""}>Closed</option>
          <option value="lost" ${l.status === "lost" ? "selected" : ""}>Lost</option>
        </select>
      </td>
    </tr>
  `).join("");
}

function updateLeadStatus(id, newStatus) {
  const list = loadLeads();
  const lead = list.find(l => l.id === id);
  if (lead) lead.status = newStatus;
  saveLeads(list);
  renderStats();
  renderTable();
}

document.addEventListener("DOMContentLoaded", () => {
  loadExhibitorUserChip();
  renderStats();
  renderTable();
  document.getElementById("statusFilter").addEventListener("change", renderTable);
});
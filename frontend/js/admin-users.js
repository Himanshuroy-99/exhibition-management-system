// Admin > Users page.
// Real version: GET /api/admin/users (joined across users + role tables),
// PATCH /api/admin/users/:id/status for suspend/activate/ban actions.

const ADMIN_USERS_KEY = "demoAdminUsers";

const SEED_USERS = [
  { id: 1, name: "Apex Expo Group", email: "contact@apexexpo.com", role: "organizer", joined: "2026-03-14", status: "active" },
  { id: 2, name: "Samsung Electronics", email: "partners@samsung.com", role: "exhibitor", joined: "2026-06-02", status: "active" },
  { id: 3, name: "GreenLeaf Textiles", email: "info@greenleaf.com", role: "exhibitor", joined: "2026-06-10", status: "active" },
  { id: 4, name: "Priya Sharma", email: "priya.sharma@gmail.com", role: "visitor", joined: "2026-07-01", status: "active" },
  { id: 5, name: "Rahul Verma", email: "rahul.v@gmail.com", role: "visitor", joined: "2026-07-03", status: "inactive" },
  { id: 6, name: "Urban Retail Co.", email: "hello@urbanretail.com", role: "exhibitor", joined: "2026-05-20", status: "banned" },
];

function loadAdminUsers() {
  const stored = localStorage.getItem(ADMIN_USERS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveAdminUsers(list) {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(list));
}

function loadAdminUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Admin";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function renderTable() {
  const tbody = document.getElementById("usersBody");
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const roleTerm = document.getElementById("roleFilter").value;
  const statusTerm = document.getElementById("statusFilter").value;

  let list = loadAdminUsers();
  if (searchTerm) {
    list = list.filter(u => u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm));
  }
  if (roleTerm) list = list.filter(u => u.role === roleTerm);
  if (statusTerm) list = list.filter(u => u.status === statusTerm);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No users match your filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td style="text-transform:capitalize;">${u.role}</td>
      <td>${new Date(u.joined).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
      <td><span class="badge ${u.status}">${u.status}</span></td>
      <td>
        <div class="row-actions">
          ${u.status !== "active" ? `<a href="#" onclick="setUserStatus(${u.id}, 'active'); return false;">Activate</a>` : ""}
          ${u.status === "active" ? `<a href="#" onclick="setUserStatus(${u.id}, 'inactive'); return false;">Suspend</a>` : ""}
          ${u.status !== "banned" ? `<button class="danger" onclick="setUserStatus(${u.id}, 'banned')">Ban</button>` : ""}
        </div>
      </td>
    </tr>
  `).join("");
}

function setUserStatus(id, newStatus) {
  if (newStatus === "banned" && !confirm("Ban this user? They won't be able to log in.")) return;
  const list = loadAdminUsers();
  const user = list.find(u => u.id === id);
  if (user) user.status = newStatus;
  saveAdminUsers(list);
  renderTable();
}

document.addEventListener("DOMContentLoaded", () => {
  loadAdminUserChip();
  renderTable();
  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("roleFilter").addEventListener("change", renderTable);
  document.getElementById("statusFilter").addEventListener("change", renderTable);
});
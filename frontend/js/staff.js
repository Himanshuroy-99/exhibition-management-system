// Booth Staff page — maps to the `booth_staff` table (marked "future beta"
// in the schema). Demo-only for now since the backend table isn't wired up yet.

const STAFF_KEY = "demoStaff";

const SEED_STAFF = [
  { id: 1, name: "Rohit Sharma", designation: "Sales Executive", email: "rohit@company.com", phone: "9876543210", status: "active" },
];

function loadStaff() {
  const stored = localStorage.getItem(STAFF_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STAFF_KEY, JSON.stringify(SEED_STAFF));
  return SEED_STAFF;
}

function saveStaff(list) {
  localStorage.setItem(STAFF_KEY, JSON.stringify(list));
}

function loadExhibitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.company_name || stored.name || "Exhibitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function renderTable() {
  const tbody = document.getElementById("staffBody");
  const list = loadStaff();

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No staff added yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.designation || "—"}</td>
      <td>${s.email || "—"}</td>
      <td>${s.phone || "—"}</td>
      <td><span class="badge ${s.status}">${s.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="danger" onclick="deleteStaff(${s.id})">Remove</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteStaff(id) {
  if (!confirm("Remove this staff member?")) return;
  saveStaff(loadStaff().filter(s => s.id !== id));
  renderTable();
}

function initModal() {
  const overlay = document.getElementById("createModal");
  const openBtn = document.getElementById("openCreateModal");
  const closeBtn = document.getElementById("closeCreateModal");
  const cancelBtn = document.getElementById("cancelCreate");
  const form = document.getElementById("staffForm");

  const close = () => {
    overlay.classList.remove("active");
    form.reset();
    document.getElementById("formError").classList.remove("active");
  };

  openBtn.addEventListener("click", () => overlay.classList.add("active"));
  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.name.trim()) {
      document.getElementById("formError").textContent = "Name is required.";
      document.getElementById("formError").classList.add("active");
      return;
    }

    const list = loadStaff();
    list.unshift({ id: Date.now(), ...data, status: "active" });
    saveStaff(list);

    close();
    renderTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadExhibitorUserChip();
  renderTable();
  initModal();
});
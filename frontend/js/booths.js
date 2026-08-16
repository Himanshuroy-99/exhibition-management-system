// Booths list + create form logic.
// Booths are linked to halls (loaded from demoHalls, same data halls.js writes).
// Supports ?hall=ID in the URL to arrive pre-filtered from the "View booths" link.

const BOOTHS_STORAGE_KEY = "demoBooths";
const HALLS_STORAGE_KEY = "demoHalls";

const SEED_HALLS_FALLBACK = [
  { id: 1, hall_name: "Hall A" },
  { id: 2, hall_name: "Hall B" },
];

const SEED_BOOTHS = [
  { id: 1, hall_id: 1, booth_number: "A-01", size: "3x3 m", location: "Near main entrance", status: "booked" },
  { id: 2, hall_id: 1, booth_number: "A-02", size: "3x3 m", location: "Aisle 1", status: "available" },
  { id: 3, hall_id: 1, booth_number: "A-03", size: "6x3 m", location: "Corner", status: "blocked" },
  { id: 4, hall_id: 2, booth_number: "B-01", size: "3x3 m", location: "Near stage", status: "booked" },
];

function getHalls() {
  const stored = localStorage.getItem(HALLS_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return SEED_HALLS_FALLBACK;
}

function loadBooths() {
  const stored = localStorage.getItem(BOOTHS_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(BOOTHS_STORAGE_KEY, JSON.stringify(SEED_BOOTHS));
  return SEED_BOOTHS;
}

function saveBooths(list) {
  localStorage.setItem(BOOTHS_STORAGE_KEY, JSON.stringify(list));
}

function loadUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Organizer";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function hallNameById(id) {
  const hall = getHalls().find(h => String(h.id) === String(id));
  return hall ? hall.hall_name : "—";
}

function populateHallDropdowns() {
  const halls = getHalls();
  const filterSelect = document.getElementById("hallFilter");
  const modalSelect = document.getElementById("hall_id");

  const optionsHtml = halls.map(h => `<option value="${h.id}">${h.hall_name}</option>`).join("");

  filterSelect.innerHTML = `<option value="">All halls</option>` + optionsHtml;
  modalSelect.innerHTML = optionsHtml;

  // Pre-select from ?hall=ID in the URL, if present.
  const params = new URLSearchParams(window.location.search);
  const hallParam = params.get("hall");
  if (hallParam && halls.some(h => String(h.id) === hallParam)) {
    filterSelect.value = hallParam;
  }
}

function renderTable() {
  const tbody = document.getElementById("boothsBody");
  const hallId = document.getElementById("hallFilter").value;
  const statusTerm = document.getElementById("statusFilter").value;

  let list = loadBooths();
  if (hallId) list = list.filter(b => String(b.hall_id) === hallId);
  if (statusTerm) list = list.filter(b => b.status === statusTerm);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No booths match your filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(b => `
    <tr>
      <td>${b.booth_number}</td>
      <td>${hallNameById(b.hall_id)}</td>
      <td>${b.size || "—"}</td>
      <td>${b.location || "—"}</td>
      <td><span class="badge ${b.status}">${b.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="danger" onclick="deleteBooth(${b.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteBooth(id) {
  if (!confirm("Delete this booth?")) return;
  const list = loadBooths().filter(b => b.id !== id);
  saveBooths(list);
  renderTable();
}

function initModal() {
  const overlay = document.getElementById("createModal");
  const openBtn = document.getElementById("openCreateModal");
  const closeBtn = document.getElementById("closeCreateModal");
  const cancelBtn = document.getElementById("cancelCreate");

  const open = () => overlay.classList.add("active");
  const close = () => {
    overlay.classList.remove("active");
    document.getElementById("createBoothForm").reset();
    document.getElementById("createFormError").classList.remove("active");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.getElementById("createBoothForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("createFormError");
    errorEl.classList.remove("active");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const existing = loadBooths();
    const duplicate = existing.some(b =>
      String(b.hall_id) === data.hall_id && b.booth_number.toLowerCase() === data.booth_number.toLowerCase()
    );
    if (duplicate) {
      errorEl.textContent = "This booth number already exists in the selected hall.";
      errorEl.classList.add("active");
      return;
    }

    existing.unshift({
      id: Date.now(),
      hall_id: Number(data.hall_id),
      booth_number: data.booth_number,
      size: data.size,
      location: data.location,
      status: data.status || "available",
    });
    saveBooths(existing);

    close();
    renderTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserChip();
  populateHallDropdowns();
  renderTable();
  initModal();
  document.getElementById("hallFilter").addEventListener("change", renderTable);
  document.getElementById("statusFilter").addEventListener("change", renderTable);
});
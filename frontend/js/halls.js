// Halls list + create form logic.
// Halls are linked to exhibitions (loaded from the same demoExhibitions
// storage used by exhibitions.js), so this page reuses that data.

const HALLS_STORAGE_KEY = "demoHalls";
const EXHIBITIONS_STORAGE_KEY = "demoExhibitions";

const SEED_EXHIBITIONS_FALLBACK = [
  { id: 1, title: "TechXpo Indore 2026" },
  { id: 2, title: "National Textile Fair" },
];

const SEED_HALLS = [
  { id: 1, exhibition_id: 1, hall_name: "Hall A", hall_number: "A-1", floor: "Ground Floor", booths: 12 },
  { id: 2, exhibition_id: 1, hall_name: "Hall B", hall_number: "B-1", floor: "First Floor", booths: 8 },
  { id: 3, exhibition_id: 2, hall_name: "Textile Pavilion", hall_number: "T-1", floor: "Ground Floor", booths: 20 },
];

function getExhibitions() {
  const stored = localStorage.getItem(EXHIBITIONS_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return SEED_EXHIBITIONS_FALLBACK;
}

function loadHalls() {
  const stored = localStorage.getItem(HALLS_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(HALLS_STORAGE_KEY, JSON.stringify(SEED_HALLS));
  return SEED_HALLS;
}

function saveHalls(list) {
  localStorage.setItem(HALLS_STORAGE_KEY, JSON.stringify(list));
}

function loadUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Organizer";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function populateExhibitionDropdowns() {
  const exhibitions = getExhibitions();
  const filterSelect = document.getElementById("exhibitionFilter");
  const modalSelect = document.getElementById("exhibition_id");

  const optionsHtml = exhibitions.map(ex => `<option value="${ex.id}">${ex.title}</option>`).join("");

  filterSelect.innerHTML = `<option value="">All exhibitions</option>` + optionsHtml;
  modalSelect.innerHTML = optionsHtml;
}

function renderTable() {
  const tbody = document.getElementById("hallsBody");
  const exhibitionId = document.getElementById("exhibitionFilter").value;

  let list = loadHalls();
  if (exhibitionId) {
    list = list.filter(h => String(h.exhibition_id) === exhibitionId);
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No halls yet for this exhibition. Add one to get started.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(h => `
    <tr>
      <td>${h.hall_name}</td>
      <td>${h.hall_number || "—"}</td>
      <td>${h.floor || "—"}</td>
      <td>${h.booths}</td>
      <td>
        <div class="row-actions">
          <a href="booths.html?hall=${h.id}">View booths</a>
          <button class="danger" onclick="deleteHall(${h.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteHall(id) {
  if (!confirm("Delete this hall? Booths inside it will also need to be reassigned.")) return;
  const list = loadHalls().filter(h => h.id !== id);
  saveHalls(list);
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
    document.getElementById("createHallForm").reset();
    document.getElementById("createFormError").classList.remove("active");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.getElementById("createHallForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("createFormError");
    errorEl.classList.remove("active");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.exhibition_id) {
      errorEl.textContent = "Please select an exhibition.";
      errorEl.classList.add("active");
      return;
    }

    const list = loadHalls();
    list.unshift({
      id: Date.now(),
      exhibition_id: Number(data.exhibition_id),
      hall_name: data.hall_name,
      hall_number: data.hall_number,
      floor: data.floor,
      description: data.description,
      booths: 0,
    });
    saveHalls(list);

    close();
    renderTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserChip();
  populateExhibitionDropdowns();
  renderTable();
  initModal();
  document.getElementById("exhibitionFilter").addEventListener("change", renderTable);
});
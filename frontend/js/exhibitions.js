// Exhibitions list + create form logic.
// Demo data + localStorage persistence for now — swap fetchExhibitions()
// and createExhibition() for real API calls once /api/organizer/exhibitions exists.

const STORAGE_KEY = "demoExhibitions";

const SEED_EXHIBITIONS = [
  { id: 1, title: "TechXpo Indore 2026", venue: "Brilliant Convention Centre", start_date: "2026-08-14", end_date: "2026-08-16", exhibitors: 42, status: "upcoming" },
  { id: 2, title: "National Textile Fair", venue: "Exhibition Grounds, Bhopal", start_date: "2026-07-01", end_date: "2026-07-04", exhibitors: 78, status: "ongoing" },
  { id: 3, title: "AutoParts Expo", venue: "Trade Centre, Pithampur", start_date: "2026-05-10", end_date: "2026-05-12", exhibitors: 55, status: "completed" },
  { id: 4, title: "Future Foods Summit", venue: "Grand Hall, Indore", start_date: "2026-09-20", end_date: "2026-09-22", exhibitors: 12, status: "draft" },
];

function loadExhibitions() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_EXHIBITIONS));
  return SEED_EXHIBITIONS;
}

function saveExhibitions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return `${s} – ${e}`;
}

function loadUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Organizer";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function renderTable() {
  const tbody = document.getElementById("exhibitionsBody");
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const statusTerm = document.getElementById("statusFilter").value;

  let list = loadExhibitions();

  if (searchTerm) {
    list = list.filter(ex =>
      ex.title.toLowerCase().includes(searchTerm) ||
      ex.venue.toLowerCase().includes(searchTerm)
    );
  }
  if (statusTerm) {
    list = list.filter(ex => ex.status === statusTerm);
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No exhibitions match your filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(ex => `
    <tr>
      <td>${ex.title}</td>
      <td>${ex.venue}</td>
      <td>${formatDateRange(ex.start_date, ex.end_date)}</td>
      <td>${ex.exhibitors}</td>
      <td><span class="badge ${ex.status}">${ex.status}</span></td>
      <td>
        <div class="row-actions">
          <a href="#" data-id="${ex.id}" class="view-link">View</a>
          <button class="danger" data-id="${ex.id}" onclick="deleteExhibition(${ex.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteExhibition(id) {
  if (!confirm("Delete this exhibition? This can't be undone.")) return;
  const list = loadExhibitions().filter(ex => ex.id !== id);
  saveExhibitions(list);
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
    document.getElementById("createExhibitionForm").reset();
    document.getElementById("createFormError").classList.remove("active");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.getElementById("createExhibitionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("createFormError");
    errorEl.classList.remove("active");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (new Date(data.end_date) < new Date(data.start_date)) {
      errorEl.textContent = "End date can't be before the start date.";
      errorEl.classList.add("active");
      return;
    }

    const list = loadExhibitions();
    const newExhibition = {
      id: Date.now(),
      title: data.title,
      venue: data.venue,
      start_date: data.start_date,
      end_date: data.end_date,
      exhibitors: 0,
      status: data.status || "draft",
    };
    list.unshift(newExhibition);
    saveExhibitions(list);

    close();
    renderTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserChip();
  renderTable();
  initModal();
  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("statusFilter").addEventListener("change", renderTable);
});
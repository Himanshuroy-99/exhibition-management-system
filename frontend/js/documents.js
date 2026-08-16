// Documents page — demo upload flow.
// Real file upload needs a backend (Multer/Cloudinary etc.), so for now
// this just records the filename + metadata client-side. Swap the submit
// handler for a real multipart/form-data POST once /api/exhibitor/documents exists.

const DOCUMENTS_KEY = "demoDocuments";

const SEED_DOCUMENTS = [
  { id: 1, title: "Company Brochure", file_type: "pdf", uploaded_at: "2026-07-20" },
  { id: 2, title: "Product Photos", file_type: "image", uploaded_at: "2026-07-18" },
];

function loadDocuments() {
  const stored = localStorage.getItem(DOCUMENTS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(SEED_DOCUMENTS));
  return SEED_DOCUMENTS;
}

function saveDocuments(list) {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(list));
}

function loadExhibitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.company_name || stored.name || "Exhibitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function renderTable() {
  const tbody = document.getElementById("documentsBody");
  const list = loadDocuments();

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No documents uploaded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(d => `
    <tr>
      <td>${d.title}</td>
      <td><span class="badge draft">${d.file_type}</span></td>
      <td>${new Date(d.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
      <td>
        <div class="row-actions">
          <button class="danger" onclick="deleteDocument(${d.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteDocument(id) {
  if (!confirm("Delete this document?")) return;
  saveDocuments(loadDocuments().filter(d => d.id !== id));
  renderTable();
}

function initUploadForm() {
  document.getElementById("uploadForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("uploadError");
    errorEl.classList.remove("active");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const fileInput = document.getElementById("file_upload");

    if (!fileInput.files.length) {
      errorEl.textContent = "Please choose a file to upload.";
      errorEl.classList.add("active");
      return;
    }

    const list = loadDocuments();
    list.unshift({
      id: Date.now(),
      title: data.title || fileInput.files[0].name,
      file_type: data.file_type,
      uploaded_at: new Date().toISOString().slice(0, 10),
    });
    saveDocuments(list);

    e.target.reset();
    renderTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadExhibitorUserChip();
  renderTable();
  initUploadForm();
});
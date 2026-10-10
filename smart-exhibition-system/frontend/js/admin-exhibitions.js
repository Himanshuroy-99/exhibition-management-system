// =====================================================
// ADMIN — EXHIBITIONS
// Platform-wide exhibition list with rollup counts, plus
// admin edit (PUT) and force-delete (DELETE) overrides.
// =====================================================
let adminExhibitions = []; // cache so the edit modal can look up a row by id

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Admin");

  document.getElementById("searchInput").addEventListener("input", render);
  document.getElementById("statusFilter").addEventListener("change", render);

  await render();
});

// =====================================================
// LIST
// =====================================================
async function render() {
  const body = document.getElementById("allExhibitionsBody");

  const params = new URLSearchParams();
  const search = document.getElementById("searchInput").value.trim();
  const status = document.getElementById("statusFilter").value;
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  try {
    const list = (await apiCall(`/admin/exhibitions?${params.toString()}`)).data || [];
    adminExhibitions = list;

    if (!list.length) {
      body.innerHTML = adminEmptyRow(10, "No exhibitions match your filters.");
      return;
    }

    body.innerHTML = list
      .map((e) => {
        const dates = `${adminFmtDate(e.start_date)} – ${adminFmtDate(e.end_date)}`;
        return `
          <tr>
            <td>${adminEsc(e.title)}</td>
            <td>${adminEsc(e.organization_name || "—")}</td>
            <td>${adminEsc(e.venue || "—")}</td>
            <td>${adminEsc(dates)}</td>
            <td>${e.hall_count} / ${e.booth_count}</td>
            <td>${e.participant_count}</td>
            <td>${e.visitor_count}</td>
            <td>${e.lead_count}</td>
            <td>${adminBadge(e.status)}</td>
            <td>
              <div class="row-actions">
                <a href="exhibition-detail.html?id=${e.exhibition_id}">View</a>
                <button onclick="openEditModal(${e.exhibition_id})">Edit</button>
                <button class="danger" onclick="removeExhibition(${e.exhibition_id})">Remove</button>
              </div>
            </td>
          </tr>`;
      })
      .join("");
  } catch (e) {
    body.innerHTML = adminEmptyRow(10, e.message);
  }
}

// =====================================================
// EDIT (admin override)
// =====================================================
function openEditModal(id) {
  const e = adminExhibitions.find((x) => x.exhibition_id === id);
  if (!e) return;

  document.getElementById("editId").value = e.exhibition_id;
  document.getElementById("editTitle").value = e.title || "";
  document.getElementById("editVenue").value = e.venue || "";
  // <input type="date"> needs yyyy-mm-dd, so slice the ISO string.
  document.getElementById("editStart").value = (e.start_date || "").slice(0, 10);
  document.getElementById("editEnd").value = (e.end_date || "").slice(0, 10);
  document.getElementById("editStatus").value = (e.status || "draft").toLowerCase();
  document.getElementById("editDescription").value = e.description || "";

  document.getElementById("editModal").classList.add("active");
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("active");
}

async function saveExhibition() {
  const id = document.getElementById("editId").value;

  // Only send the editable fields to the PUT endpoint.
  const payload = {
    title: document.getElementById("editTitle").value.trim(),
    venue: document.getElementById("editVenue").value.trim(),
    start_date: document.getElementById("editStart").value,
    end_date: document.getElementById("editEnd").value,
    status: document.getElementById("editStatus").value,
    description: document.getElementById("editDescription").value.trim(),
  };

  try {
    await apiCall(`/admin/exhibitions/${id}`, "PUT", payload);
    closeEditModal();
    await render();
  } catch (e) {
    alert(e.message);
  }
}

// =====================================================
// DELETE (admin force delete)
// =====================================================
async function removeExhibition(id) {
  if (!confirm("Delete this exhibition and ALL its halls, booths, bookings, leads and feedback? This cannot be undone.")) {
    return;
  }
  try {
    await apiCall(`/admin/exhibitions/${id}`, "DELETE");
    await render();
  } catch (e) {
    alert(e.message);
  }
}

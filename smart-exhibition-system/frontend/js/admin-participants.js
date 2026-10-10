// =====================================================
// ADMIN — PARTICIPANTS
// Who participates across the platform (exhibitor
// registrations), optionally filtered by exhibition.
// =====================================================
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Admin");

  document.getElementById("exhibitionFilter").addEventListener("change", render);

  await loadExhibitionOptions();
  await render();
});

// Fill the exhibition dropdown from the admin exhibitions list.
async function loadExhibitionOptions() {
  try {
    const list = (await apiCall("/admin/exhibitions")).data || [];
    const select = document.getElementById("exhibitionFilter");
    select.innerHTML =
      `<option value="">All exhibitions</option>` +
      list
        .map(
          (e) =>
            `<option value="${e.exhibition_id}">${adminEsc(e.title)}</option>`
        )
        .join("");
  } catch (e) {
    console.error("Failed to load exhibitions:", e);
  }
}

// =====================================================
// LIST
// =====================================================
async function render() {
  const body = document.getElementById("participantsBody");

  const exhibitionId = document.getElementById("exhibitionFilter").value;
  const query = exhibitionId ? `?exhibitionId=${encodeURIComponent(exhibitionId)}` : "";

  try {
    const list = (await apiCall(`/admin/participants${query}`)).data || [];

    if (!list.length) {
      body.innerHTML = adminEmptyRow(8, "No participants found.");
      return;
    }

    body.innerHTML = list
      .map((p) => {
        const contact = p.contact_name || p.contact_person || "—";
        const reach = [p.email, p.phone].filter(Boolean).join(" / ") || "—";
        const place = [p.hall_name, p.booth_number].filter(Boolean).join(" / ") || "—";
        return `
          <tr>
            <td>${adminEsc(p.company_name)}</td>
            <td>${adminEsc(contact)}</td>
            <td>${adminEsc(reach)}</td>
            <td>${adminEsc(p.industry || "—")}</td>
            <td>${adminEsc(p.exhibition_name || "—")}</td>
            <td>${adminEsc(place)}</td>
            <td>${adminEsc(adminFmtDate(p.registration_date))}</td>
            <td>${adminBadge(p.status)}</td>
          </tr>`;
      })
      .join("");
  } catch (e) {
    body.innerHTML = adminEmptyRow(8, e.message);
  }
}

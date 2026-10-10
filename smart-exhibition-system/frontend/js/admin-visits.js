// =====================================================
// ADMIN — VISITS
// Who visited: raw visitor logs across the platform,
// optionally filtered to one exhibition.
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
  const body = document.getElementById("visitsBody");

  const exhibitionId = document.getElementById("exhibitionFilter").value;
  const query = exhibitionId ? `?exhibitionId=${encodeURIComponent(exhibitionId)}` : "";

  try {
    const list = (await apiCall(`/admin/visits${query}`)).data || [];

    if (!list.length) {
      body.innerHTML = adminEmptyRow(9, "No visits found.");
      return;
    }

    body.innerHTML = list
      .map((v) => {
        const place = [v.hall_name, v.booth_number].filter(Boolean).join(" / ") || "—";
        const duration = v.duration != null ? `${v.duration} min` : "—";
        return `
          <tr>
            <td>${adminEsc(v.visitor_name || "—")}</td>
            <td>${adminEsc(v.visitor_email || "—")}</td>
            <td>${adminEsc(v.city || "—")}</td>
            <td>${adminEsc(v.exhibition_name || "—")}</td>
            <td>${adminEsc(place)}</td>
            <td>${adminEsc(v.exhibitor_company || "—")}</td>
            <td>${adminEsc(adminFmtDate(v.visit_date))}</td>
            <td>${adminEsc(adminFmtDateTime(v.entry_time))}</td>
            <td>${adminEsc(duration)}</td>
          </tr>`;
      })
      .join("");
  } catch (e) {
    body.innerHTML = adminEmptyRow(9, e.message);
  }
}

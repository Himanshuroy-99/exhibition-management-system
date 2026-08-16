// Exhibition Detail page (visitor side).
// Reads ?id=X from the URL and shows that exhibition's halls, booths,
// and which confirmed exhibitors occupy them — joined from the same
// demo data the organizer and exhibitor sides write to.

const EXHIBITIONS_KEY = "demoExhibitions";
const HALLS_KEY = "demoHalls";
const REQUESTS_KEY = "demoExhibitorRequests";

function getExhibitions() {
  const stored = localStorage.getItem(EXHIBITIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function getHalls() {
  const stored = localStorage.getItem(HALLS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function getConfirmedExhibitors() {
  const stored = localStorage.getItem(REQUESTS_KEY);
  const list = stored ? JSON.parse(stored) : [];
  return list.filter(r => r.status === "confirmed");
}

function loadVisitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Visitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return `${s} – ${e}`;
}

function render() {
  const params = new URLSearchParams(window.location.search);
  const exhibitionId = Number(params.get("id"));
  const exhibition = getExhibitions().find(ex => ex.id === exhibitionId);

  if (!exhibition) {
    document.getElementById("pageTitle").textContent = "Exhibition not found";
    document.getElementById("exhibitionMeta").innerHTML = `<div class="empty-state">This exhibition couldn't be found. It may have been removed.</div>`;
    return;
  }

  document.getElementById("pageTitle").textContent = exhibition.title;
  document.getElementById("exhibitionMeta").innerHTML = `
    <div style="display:flex; gap:40px; flex-wrap:wrap; align-items:center;">
      <span class="badge ${exhibition.status}">${exhibition.status}</span>
      <div><strong>${exhibition.venue}</strong></div>
      <div style="color:var(--ink-soft);">${formatDateRange(exhibition.start_date, exhibition.end_date)}</div>
    </div>
  `;

  const halls = getHalls().filter(h => h.exhibition_id === exhibitionId);
  const confirmedExhibitors = getConfirmedExhibitors().filter(r => r.exhibition_title === exhibition.title);

  const tbody = document.getElementById("hallsBody");

  if (!halls.length && !confirmedExhibitors.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No hall or exhibitor information available yet for this exhibition.</td></tr>`;
    return;
  }

  if (confirmedExhibitors.length) {
    tbody.innerHTML = confirmedExhibitors.map(r => `
      <tr>
        <td>${halls.length ? halls[0].hall_name : "—"}</td>
        <td>${r.booth_number}</td>
        <td>${r.company_name}</td>
        <td>${r.business_role || "—"}</td>
      </tr>
    `).join("");
  } else {
    tbody.innerHTML = halls.map(h => `
      <tr>
        <td>${h.hall_name}</td>
        <td colspan="3" style="color:var(--ink-soft);">No confirmed exhibitors in this hall yet.</td>
      </tr>
    `).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadVisitorUserChip();
  render();
});
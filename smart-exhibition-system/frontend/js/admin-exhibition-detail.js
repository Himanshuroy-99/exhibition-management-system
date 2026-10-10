// =====================================================
// ADMIN — EXHIBITION DETAIL
// One exhibition drilled all the way down: halls, booths,
// participants, bookings, visits, leads and feedback.
// =====================================================
let detailExhibition = null; // kept so the edit modal can prefill

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Admin");

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    document.getElementById("pageTitle").textContent = "No exhibition selected";
    return;
  }
  await load(id);
});

// =====================================================
// LOAD EVERYTHING IN ONE CALL
// =====================================================
async function load(id) {
  try {
    const { data } = await apiCall(`/admin/exhibitions/${id}`);
    const ex = data.exhibition;
    detailExhibition = ex;

    // Header + browser title.
    document.getElementById("pageTitle").textContent = ex.title || "Exhibition";
    document.title = `${ex.title} — EXHIBIT/OS Admin`;

    renderOverview(ex, data);
    renderHalls(data.booths);
    renderParticipants(data.participants);
    renderBookings(data.bookings);
    renderVisits(data.visits);
    renderLeads(data.leads);
    renderFeedback(data.feedback);
  } catch (e) {
    document.getElementById("overviewBody").innerHTML = adminEmptyRow(2, e.message);
  }
}

// =====================================================
// OVERVIEW
// =====================================================
function renderOverview(ex, data) {
  // Rollup counters.
  const counts = [
    ["Halls", data.halls.length],
    ["Booths", data.booths.length],
    ["Participants", data.participants.length],
    ["Bookings", data.bookings.length],
    ["Visits", data.visits.length],
    ["Leads", data.leads.length],
    ["Feedback", data.feedback.length],
  ];
  document.getElementById("overviewStats").innerHTML = counts
    .map(
      ([label, value]) => `
        <div class="stat-card">
          <div class="label">${adminEsc(label)}</div>
          <div class="value">${value}</div>
        </div>`
    )
    .join("");

  // Meta table.
  const rows = [
    ["Organizer", ex.organization_name || "—"],
    ["Venue", ex.venue || "—"],
    ["Dates", `${adminFmtDate(ex.start_date)} – ${adminFmtDate(ex.end_date)}`],
    ["Status", null], // rendered as a badge below
    ["Created", adminFmtDateTime(ex.created_at)],
    ["Description", ex.description || "—"],
  ];

  document.getElementById("overviewBody").innerHTML = rows
    .map(([label, value]) => {
      const cell = label === "Status" ? adminBadge(ex.status) : adminEsc(value);
      return `<tr><td style="color:var(--ink-soft);width:160px;">${adminEsc(label)}</td><td>${cell}</td></tr>`;
    })
    .join("");
}

// =====================================================
// HALLS & BOOTHS
// =====================================================
function renderHalls(booths) {
  const body = document.getElementById("hallsBody");
  if (!booths || !booths.length) {
    body.innerHTML = adminEmptyRow(7, "No booths created yet.");
    return;
  }
  body.innerHTML = booths
    .map(
      (b) => `
        <tr>
          <td>${adminEsc(b.hall_name || "—")}</td>
          <td>${adminEsc(b.floor || "—")}</td>
          <td>${adminEsc(b.booth_number)}</td>
          <td>${adminEsc(b.category || "—")}</td>
          <td>${adminEsc(b.size || "—")}</td>
          <td>${b.price != null ? adminEsc(b.price) : "—"}</td>
          <td>${adminBadge(b.status)}</td>
        </tr>`
    )
    .join("");
}

// =====================================================
// PARTICIPANTS
// =====================================================
function renderParticipants(list) {
  const body = document.getElementById("participantsBody");
  if (!list || !list.length) {
    body.innerHTML = adminEmptyRow(7, "No exhibitors registered.");
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
          <td>${adminEsc(place)}</td>
          <td>${adminEsc(adminFmtDate(p.registration_date))}</td>
          <td>${adminBadge(p.status)}</td>
        </tr>`;
    })
    .join("");
}

// =====================================================
// BOOKINGS
// =====================================================
function renderBookings(list) {
  const body = document.getElementById("bookingsBody");
  if (!list || !list.length) {
    body.innerHTML = adminEmptyRow(5, "No booth bookings.");
    return;
  }
  body.innerHTML = list
    .map(
      (b) => `
        <tr>
          <td>${adminEsc(b.company_name || "—")}</td>
          <td>${adminEsc(b.booth_number)}</td>
          <td>${adminEsc(adminFmtDate(b.booking_date))}</td>
          <td>${adminEsc(adminFmtDateTime(b.created_at))}</td>
          <td>${adminBadge(b.status)}</td>
        </tr>`
    )
    .join("");
}

// =====================================================
// VISITS
// =====================================================
function renderVisits(list) {
  const body = document.getElementById("visitsBody");
  if (!list || !list.length) {
    body.innerHTML = adminEmptyRow(7, "No visits recorded.");
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
          <td>${adminEsc(v.visitor_city || "—")}</td>
          <td>${adminEsc(place)}</td>
          <td>${adminEsc(v.exhibitor_company || "—")}</td>
          <td>${adminEsc(adminFmtDateTime(v.entry_time))}</td>
          <td>${adminEsc(duration)}</td>
        </tr>`;
    })
    .join("");
}

// =====================================================
// LEADS
// =====================================================
function renderLeads(list) {
  const body = document.getElementById("leadsBody");
  if (!list || !list.length) {
    body.innerHTML = adminEmptyRow(7, "No leads captured.");
    return;
  }
  body.innerHTML = list
    .map(
      (l) => `
        <tr>
          <td>${adminEsc(l.visitor_name || "—")}</td>
          <td>${adminEsc(l.company_name || "—")}</td>
          <td>${adminEsc(l.product_name || "—")}</td>
          <td>${adminBadge(l.interest_level)}</td>
          <td>${adminBadge(l.status)}</td>
          <td>${adminEsc(l.remarks || "—")}</td>
          <td>${adminEsc(adminFmtDateTime(l.created_at))}</td>
        </tr>`
    )
    .join("");
}

// =====================================================
// FEEDBACK
// =====================================================
function renderFeedback(list) {
  const body = document.getElementById("feedbackBody");
  if (!list || !list.length) {
    body.innerHTML = adminEmptyRow(5, "No feedback yet.");
    return;
  }
  body.innerHTML = list
    .map(
      (f) => `
        <tr>
          <td>${adminEsc(f.visitor_name || "—")}</td>
          <td>${adminEsc(f.visitor_email || "—")}</td>
          <td>${adminEsc(f.rating)} / 5</td>
          <td>${adminEsc(f.review || "—")}</td>
          <td>${adminEsc(adminFmtDate(f.created_at))}</td>
        </tr>`
    )
    .join("");
}

// =====================================================
// TABS
// =====================================================
function showTab(name) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === name);
  });
  document.querySelectorAll(".tab-section").forEach((sec) => {
    sec.classList.toggle("active", sec.id === `tab-${name}`);
  });
}

// =====================================================
// EDIT (admin override)
// =====================================================
function openEditModal() {
  const ex = detailExhibition;
  if (!ex) return;

  document.getElementById("editTitle").value = ex.title || "";
  document.getElementById("editVenue").value = ex.venue || "";
  document.getElementById("editStart").value = (ex.start_date || "").slice(0, 10);
  document.getElementById("editEnd").value = (ex.end_date || "").slice(0, 10);
  document.getElementById("editStatus").value = (ex.status || "draft").toLowerCase();
  document.getElementById("editDescription").value = ex.description || "";

  document.getElementById("editModal").classList.add("active");
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("active");
}

async function saveExhibition() {
  const id = detailExhibition.exhibition_id;
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
    await load(id);
  } catch (e) {
    alert(e.message);
  }
}

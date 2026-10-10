// =====================================================
// ADMIN DASHBOARD
// Loads platform counters and the recent activity feed.
// =====================================================
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Admin");
  loadStats();
  loadActivity();
});

// Safe text setter — ignores missing elements.
function adminSetText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "—";
}

// =====================================================
// STATS
// =====================================================
async function loadStats() {
  try {
    const { data: s } = await apiCall("/admin/stats");

    // Primary counters
    adminSetText("statUsers", s.users);
    adminSetText("statExhibitions", s.exhibitions);
    adminSetText("statExhibitors", s.exhibitors);
    adminSetText("statVisitors", s.visitors);

    // Extended counters
    adminSetText("statPendingBookings", s.bookingsPending);
    adminSetText("statBooths", `${s.allocatedBooths} / ${s.totalBooths}`);
    adminSetText("statVisits", s.totalVisits);
    adminSetText("statLeads", s.totalLeads);
    adminSetText("statFeedback", `${s.avgRating} ★ (${s.totalFeedback})`);

    // Users-by-role breakdown chips
    const breakdown = document.getElementById("roleBreakdown");
    if (breakdown) {
      breakdown.innerHTML = [
        ["Organizers", s.organizers],
        ["Exhibitors", s.exhibitors],
        ["Visitors", s.visitors],
      ]
        .map(
          ([label, value]) => `
            <div style="border:1px solid #D8E2EC;border-radius:3px;padding:14px 20px;min-width:150px;">
              <div class="label" style="font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:6px;">${adminEsc(label)}</div>
              <div style="font-size:24px;font-weight:700;color:var(--navy);">${adminEsc(value)}</div>
            </div>`
        )
        .join("");
    }
  } catch (e) {
    console.error("Failed to load stats:", e);
  }
}

// =====================================================
// ACTIVITY FEED
// =====================================================
async function loadActivity() {
  const body = document.getElementById("activityBody");
  if (!body) return;

  try {
    const rows = (await apiCall("/admin/activity?limit=15")).data || [];
    if (!rows.length) {
      body.innerHTML = adminEmptyRow(4, "No activity yet.");
      return;
    }

    body.innerHTML = rows
      .map(
        (a) => `
        <tr>
          <td>${adminBadge(a.event)}</td>
          <td>${adminEsc(a.actor || "—")}</td>
          <td>${adminEsc(a.details || "—")}</td>
          <td>${adminEsc(adminFmtDateTime(a.time))}</td>
        </tr>`
      )
      .join("");
  } catch (e) {
    body.innerHTML = adminEmptyRow(4, e.message);
  }
}

// =====================================================
// ADMIN COMMON HELPERS
// Small utilities shared by every admin page so we don't
// repeat the same formatting/escaping logic everywhere.
// Loaded BEFORE the page-specific admin script.
// =====================================================

// Escape text before injecting it into innerHTML so that
// values containing <, >, quotes etc. cannot break the table.
function adminEsc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Format an ISO date string as an Indian date (dd/mm/yyyy).
function adminFmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN");
}

// Format an ISO date string with time.
function adminFmtDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Map a raw status value to one of the .badge.* CSS classes.
function adminStatusClass(status) {
  const key = String(status || "").toLowerCase().trim();
  const map = {
    approved: "confirmed",
    confirmed: "confirmed",
    active: "available",
    available: "available",
    inactive: "closed",
    rejected: "blocked",
    blocked: "blocked",
    cancelled: "lost",
    canceled: "lost",
    allocated: "booked",
    completed: "completed",
  };
  return map[key] || key || "draft";
}

// Render a status pill using the shared badge styles.
function adminBadge(status) {
  return `<span class="badge ${adminStatusClass(status)}">${adminEsc(status || "—")}</span>`;
}

// A full-width "nothing here" table row.
function adminEmptyRow(colspan, message = "No records found.") {
  return `<tr><td colspan="${colspan}"><div class="empty-state">${adminEsc(message)}</div></td></tr>`;
}

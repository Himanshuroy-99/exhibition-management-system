// Admin dashboard — platform-wide overview.
// Real version should hit something like GET /api/admin/stats which runs
// aggregate COUNT queries across users/exhibitions/exhibitors/visitors.

const SEED_ROLE_COUNTS = { organizer: 8, exhibitor: 142, visitor: 960 };

function loadAdminUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Admin";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function renderStats() {
  const exhibitions = JSON.parse(localStorage.getItem("demoExhibitions") || "[]");
  const totalUsers = SEED_ROLE_COUNTS.organizer + SEED_ROLE_COUNTS.exhibitor + SEED_ROLE_COUNTS.visitor;

  document.getElementById("statUsers").textContent = totalUsers.toLocaleString("en-IN");
  document.getElementById("statExhibitions").textContent = exhibitions.length || 4;
  document.getElementById("statExhibitors").textContent = SEED_ROLE_COUNTS.exhibitor;
  document.getElementById("statVisitors").textContent = SEED_ROLE_COUNTS.visitor.toLocaleString("en-IN");
}

function renderRoleBreakdown() {
  const container = document.getElementById("roleBreakdown");
  const roles = [
    { label: "Organizers", count: SEED_ROLE_COUNTS.organizer, color: "var(--navy)" },
    { label: "Exhibitors", count: SEED_ROLE_COUNTS.exhibitor, color: "var(--copper)" },
    { label: "Visitors", count: SEED_ROLE_COUNTS.visitor, color: "var(--success)" },
  ];

  container.innerHTML = roles.map(r => `
    <div style="flex:1; min-width:160px; border:1px solid #D8E2EC; border-radius:3px; padding:16px 18px; border-left:3px solid ${r.color};">
      <div style="font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:var(--ink-soft);">${r.label}</div>
      <div style="font-size:24px; font-weight:700; color:var(--navy); margin-top:6px;">${r.count.toLocaleString("en-IN")}</div>
    </div>
  `).join("");
}

const SEED_ACTIVITY = [
  { event: "New exhibitor registered", actor: "Samsung Electronics", details: "Applied for TechXpo Indore 2026", time: "2 hours ago" },
  { event: "Exhibition created", actor: "Apex Expo Group", details: "Future Foods Summit", time: "5 hours ago" },
  { event: "Feedback submitted", actor: "Priya Sharma", details: "4★ — AutoParts Expo", time: "1 day ago" },
  { event: "New visitor signup", actor: "Karan Patel", details: "—", time: "1 day ago" },
];

function renderActivity() {
  const tbody = document.getElementById("activityBody");
  tbody.innerHTML = SEED_ACTIVITY.map(a => `
    <tr>
      <td>${a.event}</td>
      <td>${a.actor}</td>
      <td>${a.details}</td>
      <td style="color:var(--ink-soft);">${a.time}</td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadAdminUserChip();
  renderStats();
  renderRoleBreakdown();
  renderActivity();
});
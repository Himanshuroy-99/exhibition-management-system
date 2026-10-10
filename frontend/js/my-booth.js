const REGISTRATIONS_KEY = "demoExhibitorRegistrations";

const FALLBACK_REGISTRATIONS = [
  { id: 1, exhibition_title: "TechXpo Indore 2026", booth_number: "A-04", start_date: "2026-08-14", end_date: "2026-08-16", leads: 12, status: "confirmed" },
];

function loadExhibitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.company_name || stored.name || "Exhibitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function getRegistrations() {
  const stored = localStorage.getItem(REGISTRATIONS_KEY);
  return stored ? JSON.parse(stored) : FALLBACK_REGISTRATIONS;
}

function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return `${s} – ${e}`;
}

function boothCard(reg) {
  return `
    <div class="panel" style="margin-bottom:18px;">
      <div class="panel-head">
        <h3>${reg.exhibition_title}</h3>
        <span class="badge ${reg.status}">${reg.status}</span>
      </div>
      <div style="padding:22px; display:flex; gap:40px; flex-wrap:wrap;">
        <div>
          <div class="stat-card copper" style="border:none; padding:0;">
            <div class="label">Booth Number</div>
            <div class="value">${reg.booth_number}</div>
          </div>
        </div>
        <div>
          <div class="stat-card" style="border:none; padding:0;">
            <div class="label">Dates</div>
            <div class="value" style="font-size:18px;">${formatDateRange(reg.start_date, reg.end_date)}</div>
          </div>
        </div>
        <div>
          <div class="stat-card" style="border:none; padding:0;">
            <div class="label">Leads Collected</div>
            <div class="value" style="font-size:18px;">${reg.leads}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function render() {
  const container = document.getElementById("boothBody");
  const list = getRegistrations();
  const confirmed = list.filter(r => r.status === "confirmed");
  const pending = list.filter(r => r.status === "pending");

  let html = "";

  html += `<h3 class="section-heading" style="font-size:18px; margin-bottom:14px;">Active booths</h3>`;
  html += confirmed.length
    ? confirmed.map(boothCard).join("")
    : `<div class="panel"><div class="empty-state">No confirmed booths yet. Once an organizer approves your application, it'll show up here.</div></div>`;

  if (pending.length) {
    html += `<h3 class="section-heading" style="font-size:18px; margin:28px 0 14px;">Awaiting approval</h3>`;
    html += pending.map(boothCard).join("");
  }

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  loadExhibitorUserChip();
  render();
});
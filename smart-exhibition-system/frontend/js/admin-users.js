// =====================================================
// ADMIN — USERS
// Lists users with server-side search/filter, lets the admin
// view a full user profile and change account status.
// =====================================================
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;
  showUserChip("Admin");

  // Re-render whenever a filter changes.
  document.getElementById("searchInput").addEventListener("input", render);
  document.getElementById("roleFilter").addEventListener("change", render);
  document.getElementById("statusFilter").addEventListener("change", render);

  await render();
});

// =====================================================
// LIST
// =====================================================
async function render() {
  const body = document.getElementById("usersBody");

  // Build the query string from the current filter controls.
  const params = new URLSearchParams();
  const search = document.getElementById("searchInput").value.trim();
  const role = document.getElementById("roleFilter").value;
  const status = document.getElementById("statusFilter").value;
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (status) params.set("status", status);

  try {
    const list = (await apiCall(`/admin/users?${params.toString()}`)).data || [];

    if (!list.length) {
      body.innerHTML = adminEmptyRow(7, "No users match your filters.");
      return;
    }

    body.innerHTML = list
      .map((u) => {
        // City/Company joined into a single short cell.
        const place = [u.city, u.company].filter(Boolean).join(" · ") || "—";
        return `
          <tr>
            <td>${adminEsc(u.name)}</td>
            <td>${adminEsc(u.email)}</td>
            <td>${adminEsc(u.role)}</td>
            <td>${adminEsc(place)}</td>
            <td>${adminEsc(adminFmtDate(u.joined))}</td>
            <td>${adminBadge(u.status)}</td>
            <td>
              <div class="row-actions">
                <button onclick="viewUser(${u.user_id})">View</button>
                <button onclick="setUserStatus(${u.user_id}, 'Active')">Activate</button>
                <button onclick="setUserStatus(${u.user_id}, 'Inactive')">Deactivate</button>
                <button class="danger" onclick="setUserStatus(${u.user_id}, 'Blocked')">Block</button>
              </div>
            </td>
          </tr>`;
      })
      .join("");
  } catch (e) {
    body.innerHTML = adminEmptyRow(7, e.message);
  }
}

// =====================================================
// CHANGE STATUS
// =====================================================
async function setUserStatus(id, status) {
  try {
    await apiCall(`/admin/users/${id}/status`, "PATCH", { status });
    await render();
  } catch (e) {
    alert(e.message);
  }
}

// =====================================================
// VIEW DETAIL
// =====================================================
async function viewUser(id) {
  const modal = document.getElementById("userModal");
  const title = document.getElementById("userModalTitle");
  const bodyEl = document.getElementById("userModalBody");

  title.textContent = "Loading...";
  bodyEl.innerHTML = "";
  modal.classList.add("active");

  try {
    const { data } = await apiCall(`/admin/users/${id}`);
    const { user, profile, stats } = data;

    title.textContent = user.name || "User details";

    // Build the profile rows from whatever profile object we got.
    const profileRows = profile
      ? Object.entries(profile)
          .filter(([, v]) => v !== null && v !== undefined && v !== "")
          .map(
            ([k, v]) =>
              `<tr><td style="color:var(--ink-soft);text-transform:capitalize;">${adminEsc(k.replace(/_/g, " "))}</td><td>${adminEsc(v)}</td></tr>`
          )
          .join("")
      : `<tr><td colspan="2" class="empty-state">No profile record.</td></tr>`;

    // Build the activity stats rows.
    const statRows = Object.entries(stats || {})
      .map(
        ([k, v]) =>
          `<div style="border:1px solid #D8E2EC;border-radius:3px;padding:12px 16px;min-width:130px;">
             <div style="font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin-bottom:4px;">${adminEsc(k)}</div>
             <div style="font-size:22px;font-weight:700;color:var(--navy);">${adminEsc(v)}</div>
           </div>`
      )
      .join("");

    bodyEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <div style="font-weight:700;color:var(--navy);">${adminEsc(user.name)}</div>
          <div style="color:var(--ink-soft);font-size:13px;">${adminEsc(user.email)}</div>
        </div>
        <div>${adminBadge(user.status)}</div>
      </div>

      <table class="data-table" style="margin-bottom:18px;">
        <tbody>
          <tr><td style="color:var(--ink-soft);">Role</td><td>${adminEsc(user.role)}</td></tr>
          <tr><td style="color:var(--ink-soft);">Phone</td><td>${adminEsc(user.phone || "—")}</td></tr>
          <tr><td style="color:var(--ink-soft);">Joined</td><td>${adminEsc(adminFmtDateTime(user.created_at))}</td></tr>
        </tbody>
      </table>

      <h4 style="color:var(--navy);margin:0 0 10px;">Profile</h4>
      <table class="data-table" style="margin-bottom:18px;">
        <tbody>${profileRows}</tbody>
      </table>

      <h4 style="color:var(--navy);margin:0 0 10px;">Activity</h4>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">${statRows || '<span class="empty-state">No activity.</span>'}</div>
    `;
  } catch (e) {
    bodyEl.innerHTML = `<div class="empty-state">${adminEsc(e.message)}</div>`;
  }
}

function closeUserModal() {
  document.getElementById("userModal").classList.remove("active");
}

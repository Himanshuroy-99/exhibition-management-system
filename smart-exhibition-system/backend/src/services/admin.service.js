// =====================================================
// ADMIN SERVICE
// -----------------------------------------------------
// Admin is the platform super-user (role_id = 1).
// Unlike organizer/exhibitor endpoints, every function here
// BYPASSES ownership checks on purpose: the admin is allowed
// to see and change anything on the platform.
// =====================================================
const db = require("../config/db");

// -----------------------------------------------------
// GET USERS
// Returns every platform user with a little profile context
// (city / company) so the admin can search meaningfully.
// Optional server-side filters: role, status, search.
// -----------------------------------------------------
const getUsers = async (filters = {}) => {
  const { role, status, search } = filters;

  let sql = `
    SELECT
      u.user_id,
      u.name,
      u.email,
      u.phone,
      u.status,
      u.created_at AS joined,
      u.last_login,
      r.role_name AS role,
      COALESCE(e.head_office, v.city) AS city,
      COALESCE(e.company_name, v.company) AS company
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN exhibitors e ON e.user_id = u.user_id
    LEFT JOIN visitors v ON v.user_id = u.user_id`;

  // Build WHERE conditions only for the filters that were sent.
  const params = [];
  const where = [];

  if (role) {
    // Case-insensitive so frontend can send "Admin"/"admin".
    where.push("LOWER(r.role_name) = LOWER(?)");
    params.push(role);
  }
  if (status) {
    where.push("LOWER(u.status) = LOWER(?)");
    params.push(status);
  }
  if (search) {
    where.push("(u.name LIKE ? OR u.email LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY u.created_at DESC";

  const [rows] = await db.query(sql, params);
  return { success: true, statusCode: 200, data: rows };
};

// -----------------------------------------------------
// GET USER BY ID
// Returns the base user record (password removed), the
// role-specific profile row, and a small activity summary
// so the admin can inspect a single user in depth.
// -----------------------------------------------------
const getUserById = async (id) => {
  const [users] = await db.query(
    `SELECT u.*, r.role_name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.role_id
     WHERE u.user_id = ?`,
    [id]
  );

  if (users.length === 0) {
    return { success: false, statusCode: 404, message: "User not found" };
  }

  const user = users[0];
  delete user.password; // never expose the hash

  // Load the profile row that matches the user's role.
  let profile = null;
  if (user.role_id === 2) {
    const [rows] = await db.query(
      "SELECT * FROM organizers WHERE user_id = ?",
      [id]
    );
    profile = rows[0] || null;
  } else if (user.role_id === 3) {
    const [rows] = await db.query(
      "SELECT * FROM exhibitors WHERE user_id = ?",
      [id]
    );
    profile = rows[0] || null;
  } else if (user.role_id === 4) {
    const [rows] = await db.query(
      "SELECT * FROM visitors WHERE user_id = ?",
      [id]
    );
    profile = rows[0] || null;
  }

  // Activity summary depends on the role.
  let stats = {};
  if (user.role_id === 2) {
    // Organizer: how many exhibitions they own.
    const [[row]] = await db.query(
      `SELECT COUNT(*) AS exhibitions
       FROM exhibitions ex
       JOIN organizers o ON ex.organizer_id = o.organizer_id
       WHERE o.user_id = ?`,
      [id]
    );
    stats = { exhibitions: row.exhibitions };
  } else if (user.role_id === 3) {
    // Exhibitor: registrations, products and leads collected.
    const [[row]] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM exhibition_exhibitors ee
            JOIN exhibitors e ON ee.exhibitor_id = e.exhibitor_id
            WHERE e.user_id = ?) AS registrations,
         (SELECT COUNT(*) FROM products p
            JOIN exhibition_exhibitors ee ON p.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
            JOIN exhibitors e ON ee.exhibitor_id = e.exhibitor_id
            WHERE e.user_id = ?) AS products,
         (SELECT COUNT(*) FROM leads l
            JOIN exhibition_exhibitors ee ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
            JOIN exhibitors e ON ee.exhibitor_id = e.exhibitor_id
            WHERE e.user_id = ?) AS leads`,
      [id, id, id]
    );
    stats = {
      registrations: row.registrations,
      products: row.products,
      leads: row.leads,
    };
  } else if (user.role_id === 4) {
    // Visitor: visits, feedback left and leads generated.
    const [[row]] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM visitor_logs vl
            JOIN visitors v ON vl.visitor_id = v.visitor_id
            WHERE v.user_id = ?) AS visits,
         (SELECT COUNT(*) FROM feedback f
            JOIN visitors v ON f.visitor_id = v.visitor_id
            WHERE v.user_id = ?) AS feedback,
         (SELECT COUNT(*) FROM leads l
            JOIN visitors v ON l.visitor_id = v.visitor_id
            WHERE v.user_id = ?) AS leads`,
      [id, id, id]
    );
    stats = {
      visits: row.visits,
      feedback: row.feedback,
      leads: row.leads,
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: { user, profile, stats },
  };
};

// -----------------------------------------------------
// UPDATE USER STATUS
// Allowed values only; returns 404 if the user is missing.
// -----------------------------------------------------
const updateUserStatus = async (id, status) => {
  const allowed = ["Active", "Inactive", "Blocked"];
  if (!allowed.includes(status)) {
    return { success: false, statusCode: 400, message: "Invalid status" };
  }

  const [result] = await db.query(
    "UPDATE users SET status = ? WHERE user_id = ?",
    [status, id]
  );

  if (!result.affectedRows) {
    return { success: false, statusCode: 404, message: "User not found" };
  }

  return { success: true, statusCode: 200, message: "User status updated" };
};

// -----------------------------------------------------
// GET STATS
// Platform-wide counters used by the admin dashboard.
// Keeps the original keys (users/organizers/exhibitors/
// visitors/exhibitions) and adds operational metrics.
// -----------------------------------------------------
const getStats = async () => {
  // Run every counter in parallel for speed.
  const [
    [[users]],
    [[organizers]],
    [[exhibitors]],
    [[visitors]],
    [[exhibitions]],
    [[bookingsPending]],
    [[bookingsApproved]],
    [[totalBooths]],
    [[allocatedBooths]],
    [[totalVisits]],
    [[totalLeads]],
    [[feedbackStats]],
  ] = await Promise.all([
    db.query("SELECT COUNT(*) AS count FROM users"),
    db.query("SELECT COUNT(*) AS count FROM users WHERE role_id = 2"),
    db.query("SELECT COUNT(*) AS count FROM users WHERE role_id = 3"),
    db.query("SELECT COUNT(*) AS count FROM users WHERE role_id = 4"),
    db.query("SELECT COUNT(*) AS count FROM exhibitions"),
    db.query("SELECT COUNT(*) AS count FROM booth_bookings WHERE status = 'Pending'"),
    db.query("SELECT COUNT(*) AS count FROM booth_bookings WHERE status = 'Approved'"),
    db.query("SELECT COUNT(*) AS count FROM booths"),
    db.query("SELECT COUNT(*) AS count FROM booths WHERE status = 'Allocated'"),
    db.query("SELECT COUNT(*) AS count FROM visitor_logs"),
    db.query("SELECT COUNT(*) AS count FROM leads"),
    db.query("SELECT COUNT(*) AS c, AVG(rating) AS avg FROM feedback"),
  ]);

  return {
    success: true,
    statusCode: 200,
    data: {
      // Original dashboard keys (kept for backward compatibility).
      users: users.count,
      organizers: organizers.count,
      exhibitors: exhibitors.count,
      visitors: visitors.count,
      exhibitions: exhibitions.count,
      // Extended operational metrics.
      bookingsPending: bookingsPending.count,
      bookingsApproved: bookingsApproved.count,
      totalBooths: totalBooths.count,
      allocatedBooths: allocatedBooths.count,
      totalVisits: totalVisits.count,
      totalLeads: totalLeads.count,
      totalFeedback: feedbackStats.c,
      avgRating: feedbackStats.avg ? Number(feedbackStats.avg).toFixed(1) : "0.0",
    },
  };
};

// -----------------------------------------------------
// GET ACTIVITY
// Builds a single recent-activity feed by UNION-ing the
// newest rows from users, bookings, leads and feedback.
// -----------------------------------------------------
const getActivity = async (limit = 15) => {
  // Force a safe integer because the LIMIT is inlined.
  const safeLimit = Math.min(Math.max(Number(limit) || 15, 1), 50);

  const [rows] = await db.query(
    `SELECT * FROM (
       SELECT 'User' AS event, u.name AS actor,
              CONCAT('Registered as ', r.role_name) AS details,
              u.created_at AS time
       FROM users u
       JOIN roles r ON u.role_id = r.role_id

       UNION ALL

       SELECT 'Booking' AS event, COALESCE(e.company_name, 'Exhibitor') AS actor,
              CONCAT('Booth ', b.booth_number, ' booking ', bb.status) AS details,
              bb.created_at AS time
       FROM booth_bookings bb
       JOIN booths b ON bb.booth_id = b.booth_id
       LEFT JOIN exhibitors e ON bb.exhibitor_id = e.exhibitor_id

       UNION ALL

       SELECT 'Lead' AS event, COALESCE(u.name, 'Visitor') AS actor,
              CONCAT('Lead ', l.status, ' at ', ex.title) AS details,
              l.created_at AS time
       FROM leads l
       JOIN visitors v ON l.visitor_id = v.visitor_id
       LEFT JOIN users u ON v.user_id = u.user_id
       JOIN exhibition_exhibitors ee ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
       JOIN exhibitions ex ON ee.exhibition_id = ex.exhibition_id

       UNION ALL

       SELECT 'Feedback' AS event, COALESCE(u.name, 'Visitor') AS actor,
              CONCAT('Rated ', f.rating, '/5 at ', ex.title) AS details,
              f.created_at AS time
       FROM feedback f
       JOIN visitors v ON f.visitor_id = v.visitor_id
       LEFT JOIN users u ON v.user_id = u.user_id
       JOIN exhibitions ex ON f.exhibition_id = ex.exhibition_id
     ) AS activity
     ORDER BY time DESC
     LIMIT ${safeLimit}`
  );

  return { success: true, statusCode: 200, data: rows };
};

// -----------------------------------------------------
// GET EXHIBITIONS (oversight list)
// Every exhibition with rolled-up counts of halls, booths,
// participants, visitors and leads. Optional search/status.
// -----------------------------------------------------
const getExhibitions = async (filters = {}) => {
  const { status, search } = filters;

  let sql = `
    SELECT
      e.exhibition_id,
      e.title,
      e.description,
      e.venue,
      e.start_date,
      e.end_date,
      e.status,
      e.banner,
      e.created_at,
      o.organization_name,
      (SELECT COUNT(*) FROM halls h
         WHERE h.exhibition_id = e.exhibition_id) AS hall_count,
      (SELECT COUNT(*) FROM booths b
         JOIN halls h ON b.hall_id = h.hall_id
         WHERE h.exhibition_id = e.exhibition_id) AS booth_count,
      (SELECT COUNT(*) FROM exhibition_exhibitors ee
         WHERE ee.exhibition_id = e.exhibition_id
         AND ee.status = 'Approved') AS participant_count,
      (SELECT COUNT(DISTINCT vl.visitor_id) FROM visitor_logs vl
         JOIN booths b ON vl.booth_id = b.booth_id
         JOIN halls h ON b.hall_id = h.hall_id
         WHERE h.exhibition_id = e.exhibition_id) AS visitor_count,
      (SELECT COUNT(*) FROM leads l
         JOIN exhibition_exhibitors ee ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
         WHERE ee.exhibition_id = e.exhibition_id) AS lead_count
    FROM exhibitions e
    LEFT JOIN organizers o ON e.organizer_id = o.organizer_id`;

  const params = [];
  const where = [];

  if (status) {
    where.push("LOWER(e.status) = LOWER(?)");
    params.push(status);
  }
  if (search) {
    where.push("(e.title LIKE ? OR e.venue LIKE ? OR o.organization_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY e.created_at DESC";

  const [rows] = await db.query(sql, params);
  return { success: true, statusCode: 200, data: rows };
};

// -----------------------------------------------------
// GET EXHIBITION DETAIL (full drill-down)
// Assembles everything tied to one exhibition so the admin
// page can render Overview / Halls / Participants / Visits /
// Bookings / Leads / Feedback tabs from a single call.
// -----------------------------------------------------
const getExhibitionDetail = async (id) => {
  // 1. Exhibition + organizer.
  const [exhibitionRows] = await db.query(
    `SELECT e.*, o.organization_name, o.organizer_id
     FROM exhibitions e
     LEFT JOIN organizers o ON e.organizer_id = o.organizer_id
     WHERE e.exhibition_id = ?`,
    [id]
  );

  if (exhibitionRows.length === 0) {
    return { success: false, statusCode: 404, message: "Exhibition not found" };
  }

  // 2. Halls.
  const [halls] = await db.query(
    `SELECT * FROM halls WHERE exhibition_id = ? ORDER BY hall_id`,
    [id]
  );

  // 3. Booths (with their hall name).
  const [booths] = await db.query(
    `SELECT b.*, h.hall_name
     FROM booths b
     JOIN halls h ON b.hall_id = h.hall_id
     WHERE h.exhibition_id = ?
     ORDER BY h.hall_id, b.booth_number`,
    [id]
  );

  // 4. Participants (registered exhibitors).
  const [participants] = await db.query(
    `SELECT
       ee.exhibition_exhibitor_id,
       ee.status,
       ee.registration_date,
       e.exhibitor_id,
       e.company_name,
       e.industry,
       e.contact_person,
       e.head_office,
       u.name AS contact_name,
       u.email,
       u.phone,
       b.booth_number,
       h.hall_name
     FROM exhibition_exhibitors ee
     JOIN exhibitors e ON ee.exhibitor_id = e.exhibitor_id
     LEFT JOIN users u ON e.user_id = u.user_id
     LEFT JOIN booths b ON ee.booth_id = b.booth_id
     LEFT JOIN halls h ON b.hall_id = h.hall_id
     WHERE ee.exhibition_id = ?
     ORDER BY ee.exhibition_exhibitor_id DESC`,
    [id]
  );

  // 5. Bookings for booths in this exhibition.
  const [bookings] = await db.query(
    `SELECT bb.*, b.booth_number, e.company_name
     FROM booth_bookings bb
     JOIN booths b ON bb.booth_id = b.booth_id
     JOIN halls h ON b.hall_id = h.hall_id
     JOIN exhibitors e ON bb.exhibitor_id = e.exhibitor_id
     WHERE h.exhibition_id = ?
     ORDER BY bb.created_at DESC`,
    [id]
  );

  // 6. Visitor logs (who visited) for booths in this exhibition.
  const [visits] = await db.query(
    `SELECT
       vl.*,
       u.name AS visitor_name,
       u.email AS visitor_email,
       v.company AS visitor_company,
       v.city AS visitor_city,
       b.booth_number,
       h.hall_name,
       e.company_name AS exhibitor_company
     FROM visitor_logs vl
     JOIN visitors v ON vl.visitor_id = v.visitor_id
     LEFT JOIN users u ON v.user_id = u.user_id
     JOIN booths b ON vl.booth_id = b.booth_id
     JOIN halls h ON b.hall_id = h.hall_id
     LEFT JOIN exhibition_exhibitors ee
       ON b.booth_id = ee.booth_id AND ee.status = 'Approved'
     LEFT JOIN exhibitors e ON ee.exhibitor_id = e.exhibitor_id
     WHERE h.exhibition_id = ?
     ORDER BY vl.log_id DESC`,
    [id]
  );

  // 7. Leads captured for this exhibition.
  const [leads] = await db.query(
    `SELECT
       l.*,
       u.name AS visitor_name,
       u.email AS visitor_email,
       e.company_name,
       p.product_name
     FROM leads l
     JOIN visitors v ON l.visitor_id = v.visitor_id
     LEFT JOIN users u ON v.user_id = u.user_id
     JOIN exhibition_exhibitors ee ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
     JOIN exhibitors e ON ee.exhibitor_id = e.exhibitor_id
     LEFT JOIN products p ON l.product_id = p.product_id
     WHERE ee.exhibition_id = ?
     ORDER BY l.created_at DESC`,
    [id]
  );

  // 8. Feedback for this exhibition.
  const [feedback] = await db.query(
    `SELECT
       f.*,
       u.name AS visitor_name,
       u.email AS visitor_email
     FROM feedback f
     JOIN visitors v ON f.visitor_id = v.visitor_id
     LEFT JOIN users u ON v.user_id = u.user_id
     WHERE f.exhibition_id = ?
     ORDER BY f.created_at DESC`,
    [id]
  );

  return {
    success: true,
    statusCode: 200,
    data: {
      exhibition: exhibitionRows[0],
      halls,
      booths,
      participants,
      bookings,
      visits,
      leads,
      feedback,
    },
  };
};

// -----------------------------------------------------
// UPDATE EXHIBITION (admin override)
// Same fields as the organizer endpoint but WITHOUT the
// ownership check — admin can edit any exhibition.
// -----------------------------------------------------
const updateExhibition = async (id, data) => {
  const { title, description, venue, start_date, end_date, status, banner } = data;

  // Make sure the exhibition exists first.
  const [existing] = await db.query(
    "SELECT exhibition_id FROM exhibitions WHERE exhibition_id = ?",
    [id]
  );
  if (existing.length === 0) {
    return { success: false, statusCode: 404, message: "Exhibition not found" };
  }

  // Validate dates only when they are being changed.
  if (start_date || end_date) {
    if (!start_date || !end_date) {
      return {
        success: false,
        statusCode: 400,
        message: "Both start date and end date are required when updating dates",
      };
    }
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { success: false, statusCode: 400, message: "Invalid exhibition dates" };
    }
    if (end < start) {
      return {
        success: false,
        statusCode: 400,
        message: "End date cannot be before start date",
      };
    }
  }

  // COALESCE keeps existing values when a field is not sent.
  await db.query(
    `UPDATE exhibitions
     SET
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       venue = COALESCE(?, venue),
       start_date = COALESCE(?, start_date),
       end_date = COALESCE(?, end_date),
       status = COALESCE(?, status),
       banner = COALESCE(?, banner)
     WHERE exhibition_id = ?`,
    [title, description, venue, start_date, end_date, status, banner || null, id]
  );

  return { success: true, statusCode: 200, message: "Exhibition updated successfully" };
};

// -----------------------------------------------------
// DELETE EXHIBITION (admin force delete)
// Removes the exhibition AND all dependent rows in the
// correct order inside one transaction, so foreign-key
// constraints never block an admin delete.
// -----------------------------------------------------
const deleteExhibition = async (id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Confirm it exists before deleting anything.
    const [existing] = await connection.query(
      "SELECT exhibition_id FROM exhibitions WHERE exhibition_id = ?",
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return { success: false, statusCode: 404, message: "Exhibition not found" };
    }

    // Children first, parents last.
    await connection.query(
      `DELETE vl FROM visitor_logs vl
       JOIN booths b ON vl.booth_id = b.booth_id
       JOIN halls h ON b.hall_id = h.hall_id
       WHERE h.exhibition_id = ?`,
      [id]
    );
    await connection.query(
      `DELETE l FROM leads l
       JOIN exhibition_exhibitors ee ON l.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
       WHERE ee.exhibition_id = ?`,
      [id]
    );
    await connection.query("DELETE FROM feedback WHERE exhibition_id = ?", [id]);
    await connection.query("DELETE FROM reports WHERE exhibition_id = ?", [id]);
    await connection.query(
      `DELETE p FROM products p
       JOIN exhibition_exhibitors ee ON p.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
       WHERE ee.exhibition_id = ?`,
      [id]
    );
    await connection.query(
      `DELETE bd FROM booth_documents bd
       JOIN exhibition_exhibitors ee ON bd.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
       WHERE ee.exhibition_id = ?`,
      [id]
    );
    await connection.query(
      `DELETE bs FROM booth_staff bs
       JOIN exhibition_exhibitors ee ON bs.exhibition_exhibitor_id = ee.exhibition_exhibitor_id
       WHERE ee.exhibition_id = ?`,
      [id]
    );
    await connection.query(
      "DELETE FROM exhibition_exhibitors WHERE exhibition_id = ?",
      [id]
    );
    await connection.query(
      `DELETE bb FROM booth_bookings bb
       JOIN booths b ON bb.booth_id = b.booth_id
       JOIN halls h ON b.hall_id = h.hall_id
       WHERE h.exhibition_id = ?`,
      [id]
    );
    await connection.query(
      `DELETE b FROM booths b
       JOIN halls h ON b.hall_id = h.hall_id
       WHERE h.exhibition_id = ?`,
      [id]
    );
    await connection.query("DELETE FROM halls WHERE exhibition_id = ?", [id]);
    await connection.query("DELETE FROM exhibitions WHERE exhibition_id = ?", [id]);

    await connection.commit();
    return { success: true, statusCode: 200, message: "Exhibition deleted successfully" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// -----------------------------------------------------
// GET PARTICIPANTS
// Who participates: exhibitor registrations joined with the
// exhibitor, its contact user, booth and hall. Optionally
// narrowed to one exhibition via exhibitionId.
// -----------------------------------------------------
const getParticipants = async (filters = {}) => {
  const { exhibitionId } = filters;

  let sql = `
    SELECT
      ee.exhibition_exhibitor_id,
      ee.status,
      ee.registration_date,
      ex.exhibition_id,
      ex.title AS exhibition_name,
      e.exhibitor_id,
      e.company_name,
      e.industry,
      e.contact_person,
      e.head_office,
      u.name AS contact_name,
      u.email,
      u.phone,
      b.booth_number,
      b.size,
      h.hall_name
    FROM exhibition_exhibitors ee
    JOIN exhibitions ex ON ee.exhibition_id = ex.exhibition_id
    JOIN exhibitors e ON ee.exhibitor_id = e.exhibitor_id
    LEFT JOIN users u ON e.user_id = u.user_id
    LEFT JOIN booths b ON ee.booth_id = b.booth_id
    LEFT JOIN halls h ON b.hall_id = h.hall_id`;

  const params = [];
  if (exhibitionId) {
    sql += " WHERE ee.exhibition_id = ?";
    params.push(exhibitionId);
  }
  sql += " ORDER BY ee.exhibition_exhibitor_id DESC";

  const [rows] = await db.query(sql, params);
  return { success: true, statusCode: 200, data: rows };
};

// -----------------------------------------------------
// GET VISITS
// Who visited: raw visitor logs joined with visitor, booth,
// hall and exhibition. Optionally narrowed to one exhibition.
// -----------------------------------------------------
const getVisits = async (filters = {}) => {
  const { exhibitionId } = filters;

  let sql = `
    SELECT
      vl.log_id,
      vl.entry_time,
      vl.exit_time,
      vl.duration,
      vl.visit_date,
      v.visitor_id,
      v.company AS visitor_company,
      v.designation,
      v.city,
      u.name AS visitor_name,
      u.email AS visitor_email,
      u.phone AS visitor_phone,
      b.booth_number,
      h.hall_name,
      ex.exhibition_id,
      ex.title AS exhibition_name,
      e.company_name AS exhibitor_company
    FROM visitor_logs vl
    JOIN visitors v ON vl.visitor_id = v.visitor_id
    LEFT JOIN users u ON v.user_id = u.user_id
    JOIN booths b ON vl.booth_id = b.booth_id
    JOIN halls h ON b.hall_id = h.hall_id
    JOIN exhibitions ex ON h.exhibition_id = ex.exhibition_id
    LEFT JOIN exhibition_exhibitors ee
      ON b.booth_id = ee.booth_id AND ee.status = 'Approved'
    LEFT JOIN exhibitors e ON ee.exhibitor_id = e.exhibitor_id`;

  const params = [];
  if (exhibitionId) {
    sql += " WHERE ex.exhibition_id = ?";
    params.push(exhibitionId);
  }
  sql += " ORDER BY vl.log_id DESC";

  const [rows] = await db.query(sql, params);
  return { success: true, statusCode: 200, data: rows };
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  getStats,
  getActivity,
  getExhibitions,
  getExhibitionDetail,
  updateExhibition,
  deleteExhibition,
  getParticipants,
  getVisits,
};

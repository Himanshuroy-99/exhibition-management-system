const db = require("../config/db");

const createHall = async (data, userId) => {
  const { exhibition_id, hall_name, hall_number, floor, description } = data;
  if (!exhibition_id || !hall_name) return { success:false, statusCode:400, message:"Exhibition ID and hall name are required" };

  const [organizer] = await db.query(
    `SELECT o.organizer_id FROM organizers o WHERE o.user_id = ?`, [userId]
  );
  if (!organizer.length) return { success:false, statusCode:404, message:"Organizer profile not found" };

  const [exhibition] = await db.query(
    `SELECT exhibition_id FROM exhibitions WHERE exhibition_id=? AND organizer_id=?`,
    [exhibition_id, organizer[0].organizer_id]
  );
  if (!exhibition.length) return { success:false, statusCode:403, message:"You can only create halls for your own exhibitions" };

  const [result] = await db.query(
    `INSERT INTO halls (exhibition_id, hall_name, hall_number, floor, description)
     VALUES (?, ?, ?, ?, ?)`,
    [exhibition_id, hall_name, hall_number || null, floor || null, description || null]
  );
  return { success:true, statusCode:201, message:"Hall created successfully", hallId:result.insertId };
};

const getAllHalls = async (user) => {
  let sql = `SELECT h.*, e.title AS exhibition_name, e.organizer_id
             FROM halls h JOIN exhibitions e ON h.exhibition_id=e.exhibition_id`;
  const params = [];
  if (user && user.roleId === 2) {
    const [org] = await db.query("SELECT organizer_id FROM organizers WHERE user_id=?", [user.userId]);
    if (!org.length) return { success:true,statusCode:200,data:[] };
    sql += " WHERE e.organizer_id = ?";
    params.push(org[0].organizer_id);
  }
  if (user && user.roleId === 3) {
    // Exhibitors can see halls so they can select available booths.
  }
  sql += " ORDER BY h.hall_id DESC";
  const [rows] = await db.query(sql, params);
  return { success:true,statusCode:200,data:rows };
};

const getHallById = async (id) => {
  const [rows] = await db.query(
    `SELECT h.*, e.title AS exhibition_name FROM halls h JOIN exhibitions e ON h.exhibition_id=e.exhibition_id WHERE h.hall_id=?`,
    [id]
  );
  if (!rows.length) return {success:false,statusCode:404,message:"Hall not found"};
  return {success:true,statusCode:200,data:rows[0]};
};

module.exports = { createHall, getAllHalls, getHallById };

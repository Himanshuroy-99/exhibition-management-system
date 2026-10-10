// Authentication business logic.
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (userData) => {
  const {
    role_id,
    name,
    email,
    password,
    phone,
    organization_name,
    city,
    company_name,
    industry,
    gst_number,
    company,
    designation,
  } = userData;

  const roleId = Number(role_id);

  // Public signup is allowed for Organizer, Exhibitor and Visitor.
  // Admin accounts must be created manually.
  if (![2, 3, 4].includes(roleId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid role for signup",
    };
  }

  if (!name || !email || !password) {
    return {
      success: false,
      statusCode: 400,
      message: "Name, email and password are required",
    };
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existingUser] = await connection.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return {
        success: false,
        statusCode: 409,
        message: "User already exist",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      `INSERT INTO users(role_id, name, email, password, phone)
       VALUES(?,?,?,?,?)`,
      [roleId, name, email, hashedPassword, phone || null]
    );

    const userId = result.insertId;

    // Create the role profile at signup so protected modules can be used
    // immediately after login.
    if (roleId === 2) {
      await connection.query(
        `INSERT INTO organizers (user_id, organization_name)
         VALUES (?, ?)`,
        [userId, organization_name || name]
      );
    }

    if (roleId === 3) {
      await connection.query(
        `INSERT INTO exhibitors
          (user_id, company_name, industry, gst_number, head_office, contact_person)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          company_name || name,
          industry || null,
          gst_number || null,
          city || null,
          name,
        ]
      );
    }

    if (roleId === 4) {
      await connection.query(
        `INSERT INTO visitors
          (user_id, company, designation, city)
         VALUES (?, ?, ?, ?)`,
        [userId, company || null, designation || null, city || null]
      );
    }

    await connection.commit();

    return {
      success: true,
      statusCode: 201,
      message: "User registered successfully",
      userId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const login = async (userData) => {
  const { email, password } = userData;

  const [user] = await db.query(
    "SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = ?",
    [email]
  );

  if (user.length === 0) {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  if (user[0].status && String(user[0].status).toLowerCase() !== "active") {
    return {
      success: false,
      statusCode: 403,
      message: "Your account is not active",
    };
  }

  const isMatch = await bcrypt.compare(password, user[0].password);

  if (!isMatch) {
    return {
      success: false,
      statusCode: 401,
      message: "Invalid email or password",
    };
  }

  const token = jwt.sign(
    {
      userId: user[0].user_id,
      roleId: user[0].role_id,
      email: user[0].email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  await db.query(
    "UPDATE users SET last_login = NOW() WHERE user_id = ?",
    [user[0].user_id]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Login successful",
    token,
    role: user[0].role_name,
    user: {
      userId: user[0].user_id,
      name: user[0].name,
      email: user[0].email,
      phone: user[0].phone,
      roleId: user[0].role_id,
      role: user[0].role_name,
    },
  };
};

module.exports = { signup, login };

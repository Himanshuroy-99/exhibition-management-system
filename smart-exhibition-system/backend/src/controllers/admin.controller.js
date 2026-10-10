// =====================================================
// ADMIN CONTROLLER
// Thin HTTP layer — reads the request, delegates to the
// admin service, and always answers with JSON.
// =====================================================
const service = require("../services/admin.service");

// GET /admin/users — optional query filters: role, status, search
const getUsers = async (req, res) => {
  try {
    const result = await service.getUsers(req.query);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /admin/users/:id — full user + profile + activity
const getUserById = async (req, res) => {
  try {
    const result = await service.getUserById(req.params.id);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PATCH /admin/users/:id/status — body: { status }
const updateUserStatus = async (req, res) => {
  try {
    const result = await service.updateUserStatus(req.params.id, req.body.status);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /admin/stats — platform counters
const getStats = async (req, res) => {
  try {
    const result = await service.getStats();
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /admin/activity — recent activity feed
const getActivity = async (req, res) => {
  try {
    const result = await service.getActivity(req.query.limit);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /admin/exhibitions — all exhibitions + rollup counts
const getExhibitions = async (req, res) => {
  try {
    const result = await service.getExhibitions(req.query);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /admin/exhibitions/:id — full drill-down bundle
const getExhibitionDetail = async (req, res) => {
  try {
    const result = await service.getExhibitionDetail(req.params.id);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /admin/exhibitions/:id — admin edit any exhibition
const updateExhibition = async (req, res) => {
  try {
    const result = await service.updateExhibition(req.params.id, req.body);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /admin/exhibitions/:id — admin force delete
const deleteExhibition = async (req, res) => {
  try {
    const result = await service.deleteExhibition(req.params.id);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /admin/participants — who participates (optional ?exhibitionId=)
const getParticipants = async (req, res) => {
  try {
    const result = await service.getParticipants(req.query);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /admin/visits — who visited (optional ?exhibitionId=)
const getVisits = async (req, res) => {
  try {
    const result = await service.getVisits(req.query);
    res.status(result.statusCode || 200).json(result);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
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

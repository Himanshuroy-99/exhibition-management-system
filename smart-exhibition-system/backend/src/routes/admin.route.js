// =====================================================
// ADMIN ROUTES  (all restricted to role_id = 1)
// authenticate -> verifies the JWT
// authorize(1) -> only Admin may continue
// =====================================================
const express = require("express");
const router = express.Router();
const controller = require("../controllers/admin.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

// ----- Users -----
router.get("/users", authenticate, authorize(1), controller.getUsers);
router.get("/users/:id", authenticate, authorize(1), controller.getUserById);
router.patch("/users/:id/status", authenticate, authorize(1), controller.updateUserStatus);

// ----- Dashboard -----
router.get("/stats", authenticate, authorize(1), controller.getStats);
router.get("/activity", authenticate, authorize(1), controller.getActivity);

// ----- Exhibitions (oversight + override) -----
router.get("/exhibitions", authenticate, authorize(1), controller.getExhibitions);
router.get("/exhibitions/:id", authenticate, authorize(1), controller.getExhibitionDetail);
router.put("/exhibitions/:id", authenticate, authorize(1), controller.updateExhibition);
router.delete("/exhibitions/:id", authenticate, authorize(1), controller.deleteExhibition);

// ----- Cross-module oversight -----
router.get("/participants", authenticate, authorize(1), controller.getParticipants);
router.get("/visits", authenticate, authorize(1), controller.getVisits);

module.exports = router;

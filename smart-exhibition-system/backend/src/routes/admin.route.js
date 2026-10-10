const express=require("express");
const router=express.Router();
const controller=require("../controllers/admin.controller");
const authenticate=require("../middleware/auth.middleware");
const authorize=require("../middleware/role.middleware");
router.get("/users",authenticate,authorize(1),controller.getUsers);
router.patch("/users/:id/status",authenticate,authorize(1),controller.updateUserStatus);
router.get("/stats",authenticate,authorize(1),controller.getStats);
module.exports=router;

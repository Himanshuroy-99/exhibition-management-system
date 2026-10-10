const express=require("express");
const router=express.Router();
const controller=require("../controllers/hall.controller");
const authenticate=require("../middleware/auth.middleware");
const authorize=require("../middleware/role.middleware");
router.post("/",authenticate,authorize(2),controller.createHall);
router.get("/",authenticate,authorize(1,2,3,4),controller.getAllHalls);
router.get("/:id",authenticate,authorize(1,2,3,4),controller.getHallById);
module.exports=router;

const service=require("../services/hall.service");
const createHall=async(req,res)=>{try{const r=await service.createHall(req.body,req.user.userId);res.status(r.statusCode||201).json(r)}catch(e){res.status(500).json({success:false,message:e.message})}};
const getAllHalls=async(req,res)=>{try{const r=await service.getAllHalls(req.user);res.status(r.statusCode||200).json(r)}catch(e){res.status(500).json({success:false,message:e.message})}};
const getHallById=async(req,res)=>{try{const r=await service.getHallById(req.params.id);res.status(r.statusCode||200).json(r)}catch(e){res.status(500).json({success:false,message:e.message})}};
module.exports={createHall,getAllHalls,getHallById};

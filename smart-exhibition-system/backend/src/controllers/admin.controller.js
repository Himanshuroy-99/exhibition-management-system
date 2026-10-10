const service=require("../services/admin.service");
const getUsers=async(req,res)=>{try{const r=await service.getUsers();res.status(r.statusCode||200).json(r)}catch(e){res.status(500).json({success:false,message:e.message})}};
const updateUserStatus=async(req,res)=>{try{const r=await service.updateUserStatus(req.params.id,req.body.status);res.status(r.statusCode||200).json(r)}catch(e){res.status(500).json({success:false,message:e.message})}};
const getStats=async(req,res)=>{try{const r=await service.getStats();res.status(r.statusCode||200).json(r)}catch(e){res.status(500).json({success:false,message:e.message})}};
module.exports={getUsers,updateUserStatus,getStats};

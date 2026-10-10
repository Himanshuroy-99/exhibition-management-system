const db=require("../config/db");

const getUsers=async()=>{
 const [rows]=await db.query(
 `SELECT u.user_id,u.name,u.email,u.status,u.created_at AS joined,r.role_name AS role
  FROM users u JOIN roles r ON u.role_id=r.role_id ORDER BY u.created_at DESC`);
 return {success:true,statusCode:200,data:rows};
};
const updateUserStatus=async(id,status)=>{
 const allowed=["Active","Inactive","Blocked"];
 if(!allowed.includes(status)) return {success:false,statusCode:400,message:"Invalid status"};
 const [result]=await db.query("UPDATE users SET status=? WHERE user_id=?",[status,id]);
 if(!result.affectedRows) return {success:false,statusCode:404,message:"User not found"};
 return {success:true,statusCode:200,message:"User status updated"};
};
const getStats=async()=>{
 const [[users]] = await db.query("SELECT COUNT(*) AS count FROM users");
 const [[organizers]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role_id=2");
 const [[exhibitors]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role_id=3");
 const [[visitors]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role_id=4");
 const [[exhibitions]] = await db.query("SELECT COUNT(*) AS count FROM exhibitions");
 return {success:true,statusCode:200,data:{users:users.count,organizers:organizers.count,exhibitors:exhibitors.count,visitors:visitors.count,exhibitions:exhibitions.count}};
};
module.exports={getUsers,updateUserStatus,getStats};

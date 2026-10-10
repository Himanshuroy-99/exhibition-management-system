const exhibitionExhibitorService = require("../services/exhibitionExhibitor.service");

// CREATE EXHIBITION EXHIBITOR
const createExhibitionExhibitor = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.user.roleId === 3) {
      const [rows] = await require("../config/db").query(
        "SELECT exhibitor_id FROM exhibitors WHERE user_id = ?",
        [req.user.userId]
      );
      if (!rows.length) return res.status(404).json({ success:false, message:"Exhibitor profile not found" });
      data.exhibitor_id = rows[0].exhibitor_id;
    }
    const result =
      await exhibitionExhibitorService.createExhibitionExhibitor(data);

    res.status(result.statusCode || 201).json(result);
  } catch (error) {
    console.error("Create Exhibition Exhibitor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyExhibitionExhibitors = async (req,res) => {
  try { const result=await exhibitionExhibitorService.getMyExhibitionExhibitors(req.user.userId); res.status(result.statusCode||200).json(result); }
  catch(error){ res.status(500).json({success:false,message:error.message}); }
};

// GET ALL EXHIBITION EXHIBITORS
const getAllExhibitionExhibitors = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.getAllExhibitionExhibitors();

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get All Exhibition Exhibitors Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET EXHIBITION EXHIBITOR BY ID
const getExhibitionExhibitorById = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.getExhibitionExhibitorById(
        req.params.id,
        req.user
      );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Exhibition Exhibitor By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE STATUS
const updateStatus = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.updateStatus(
        req.params.id,
        req.body.status
      );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Update Exhibition Exhibitor Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE EXHIBITION EXHIBITOR
const deleteExhibitionExhibitor = async (req, res) => {
  try {
    const result =
      await exhibitionExhibitorService.deleteExhibitionExhibitor(
        req.params.id
      );

    res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Delete Exhibition Exhibitor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  getMyExhibitionExhibitors,
  createExhibitionExhibitor,
  getAllExhibitionExhibitors,
  getExhibitionExhibitorById,
  updateStatus,
  deleteExhibitionExhibitor,
};
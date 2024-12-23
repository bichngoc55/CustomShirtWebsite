const express = require("express");
const {
  createDesign,
  updateDesign,
  getDesignById,
  deleteDesign,
  getUserDesigns,
} = require("../controllers/designController.js");
const verifyToken = require("../middleware/authMiddleware.js");

const router = express.Router();

/* READ */
router.get("/", verifyToken, getUserDesigns);

/* READ */
router.get("/:id", getDesignById);

/* CREATE */
router.post("/add", createDesign);
/* UPDATE */
router.patch("/:id", updateDesign);

/* DELETE */
router.delete("/:id", deleteDesign);
module.exports = router;

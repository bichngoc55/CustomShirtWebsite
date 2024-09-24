const verifyToken = require("../middleware/authMiddleware.js");
const express = require("express");
const {
  getAllUsers,
  getDetailUser,
  updateUser,
  addUser,
  deleteUser,
} = require("../controllers/userController.js");
const checkIsAdmin = require("../middleware/isAdminMiddleware.js");
const router = express.Router();

/* READ */
router.get("/", getAllUsers);
/* READ */
router.get("/:id", verifyToken, getDetailUser);
/* CREATE */
router.post("/add", verifyToken, checkIsAdmin, addUser);
/* UPDATE */
router.patch("/:id", verifyToken, checkIsAdmin, updateUser);

/* DELETE */
router.delete("/:id", verifyToken, checkIsAdmin, deleteUser);
module.exports = router;

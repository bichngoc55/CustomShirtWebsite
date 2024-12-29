const verifyToken = require("../middleware/authMiddleware.js");
const express = require("express");
const {
  getAllUsers,
  getDetailUser,
  updateUser,
  addUser,
  deleteUser,
  getRecentViewdProduct,
  addRecentViewdProduct,
} = require("../controllers/userController.js");
const checkIsAdmin = require("../middleware/isAdminMiddleware.js");
const router = express.Router();
router.patch("/recentProduct", addRecentViewdProduct);
router.patch("/:id",  updateUser);

router.get("/recentProduct/:id", getRecentViewdProduct);
/* READ */
router.get("/", getAllUsers);
/* READ */
router.get("/:id", verifyToken, getDetailUser);
/* CREATE */
router.post("/add", verifyToken, checkIsAdmin, addUser);
/* UPDATE */
 /* UPDATE */

/* DELETE */
router.delete("/:id",  deleteUser);
module.exports = router;

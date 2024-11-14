const express = require("express");
const {
  getAllShirts,
  getDetailShirt,
  updateShirt,
  addShirt,
  deleteShirt,
  updateShirtReview,
} = require("../controllers/shirtController.js");

const router = express.Router();
const checkIsAdmin = require("../middleware/isAdminMiddleware.js");
/* READ */
router.get("/", getAllShirts);

/* READ */
router.get("/:id", getDetailShirt);
/* CREATE */
router.post("/add", addShirt);
/* UPDATE */
// router.patch("/:id", checkIsAdmin, updateShirt);
router.patch("/:id", updateShirt);

router.patch("/:id/review", updateShirtReview);
/* DELETE */
router.delete("/:id", checkIsAdmin, deleteShirt);

module.exports = router;

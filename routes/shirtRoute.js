const express = require("express");
const {
  getAllShirts,
  getDetailShirt,
  updateShirt,
  addShirt,
  deleteShirt,
  updateShirtReview,
} = require("../controllers/shirtController.js");
const imageSearchService = require("../utils/imageSearchService.js");
const multer = require("multer");
const upload = multer();
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
router.delete("/:id", deleteShirt);
router.post("/search-by-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await imageSearchService.searchByImage(req.file.buffer);

    res.json({
      detectedLabels: result.detectedLabels,
      products: result.products,
    });
  } catch (error) {
    console.error("Image search error:", error);
    res.status(500).json({ message: "Failed to search products by image" });
  }
});

module.exports = router;

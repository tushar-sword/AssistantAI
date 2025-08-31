const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
} = require("../Controllers/productController");
const { protect } = require("../Middleware/authMiddleware");
const upload = require("../Middleware/uploadMiddleware");

const router = express.Router();

router.post("/", protect, upload.array("images", 4), createProduct); // Add product (private, upload max 4)
router.get("/", getProducts);                                        // Get all products (public)
router.get("/:id", getProductById);                                  // Get product by ID (public)

module.exports = router;

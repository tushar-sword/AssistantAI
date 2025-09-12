const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
} = require("../Controllers/productController");
const { protect } = require("../Middleware/authMiddleware");
const upload = require("../Middleware/uploadMiddleware");

const router = express.Router();

// Add product (private, upload max 4)
router.post("/", protect, upload.array("images", 4), createProduct);

// Get all products (public)
router.get("/", getProducts);

// Get product by ID (public)
router.get("/:id", getProductById);

module.exports = router;

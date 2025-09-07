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
// routes/products.js
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Also fetch AI enhancements
    const enhancement = await AiEnhancement.findOne({ productId: product._id });

    res.json({
      ...product.toObject(),
      enhancedImages: enhancement ? enhancement.enhancedImages : [],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product", details: err.message });
  }
});

module.exports = router;

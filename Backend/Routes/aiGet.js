const express = require("express");
const Product = require("../models/product.js");
const AiEnhancement = require("../models/AiEnhancement.js");

const router = express.Router();

/**
 * Get AI-enhanced product details by product ID
 */
router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find AI enhancement if exists
    const enhancement = await AiEnhancement.findOne({ productId: id });

    res.json({
      product,
      aiEnhancement: enhancement || null,
    });
  } catch (err) {
    console.error("❌ Fetch AI-enhanced product failed:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

/**
 * Get all AI-enhanced products (for AIProductEnhanceReview page)
 */
router.get("/products", async (req, res) => {
  try {
    const enhancements = await AiEnhancement.find().populate("productId");

    const results = enhancements.map((enh) => ({
      product: enh.productId,
      aiEnhancement: enh,
    }));

    res.json(results);
  } catch (err) {
    console.error("❌ Fetch all AI-enhanced products failed:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
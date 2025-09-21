// routes/aiContentRoutes.js
const express = require("express");
const router = express.Router();
const { generateForProduct } = require("../Controllers/aiContentController");
const AiContent = require("../models/AiContent");

// POST /api/ai-content/generate/:productId
router.post("/generate/:productId", generateForProduct);

// GET content by product
router.get("/product/:productId", async (req, res) => {
  const { productId } = req.params;
  console.log("📌 [HIT] /product/:productId", productId);
  try {
    const doc = await AiContent.findOne({ productId });
    if (!doc) {
      console.log("⚠️ No AI content found for product:", productId);
      return res.status(404).json({ message: "No AI content for that product" });
    }
    console.log("✅ Returning AI content:", doc._id);
    res.json(doc);
  } catch (err) {
    console.error("❌ fetch ai content error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// routes/aiContent.js
const express = require("express");
const AiContent = require("../models/AiContent.js");
const Product = require("../models/product.js");

const router = express.Router();

/**
 * ===============================
 * 1️⃣ Generate AI Content for Product (Test Mode)
 * ===============================
 */
router.post("/generate/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    console.log("🚀 [HIT] /generate route called");
    console.log("📌 productId from params:", productId);
    console.log("📦 req.body:", req.body);

    const product = await Product.findById(productId);
    if (!product) {
      console.log("❌ Product not found in DB");
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✅ Product found:", {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
    });

    // ===============================
    // ⏸️ Commented: AI Content Generation
    // const prompt = ` ... `
    // const aiText = await groqChat(prompt);
    // const parsedContent = safeParseJSON(aiText);
    // const aiContent = await AiContent.findOneAndUpdate(
    //   { productId },
    //   { content: parsedContent, rawText: aiText },
    //   { upsert: true, new: true }
    // );
    // return res.json({ productId, content: aiContent.content, rawText: aiContent.rawText });
    // ===============================

    // For now, just send back product info for debugging
    res.json({
      success: true,
      message: "Route hit successfully!",
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: product.images,
      },
    });
  } catch (err) {
    console.error("❌ AI Content route error:", err);
    res.status(500).json({ error: "Route failed", details: err.message });
  }
});

/**
 * ===============================
 * 2️⃣ Fetch AI Content by Product ID
 * ===============================
 */
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("📌 [HIT] /product/:productId", productId);

    const content = await AiContent.findOne({ productId });
    if (!content) {
      console.log("⚠️ No AI content found for product:", productId);
      return res.status(404).json({ error: "Content not found" });
    }

    console.log("✅ Content fetched:", content._id);
    res.json(content);
  } catch (err) {
    console.error("❌ Fetch AI content error:", err);
    res.status(500).json({ error: "Failed to fetch AI content", details: err.message });
  }
});

module.exports = router;

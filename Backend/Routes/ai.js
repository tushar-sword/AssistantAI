// routes/ai.js
const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const Product = require("../models/product.js");
const AiEnhancement = require("../models/AiEnhancement.js");

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Enhance all product images using Cloudinary transformations
 */
router.post("/enhance-image/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📌 Enhancing images for product ID:", id);

    const product = await Product.findById(id);
    if (!product) {
      console.error("❌ Product not found:", id);
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✅ Product found:", product._id, "with", product.images.length, "images");

    const enhancedPairs = [];

    for (const img of product.images) {
      console.log("🔄 Processing image:", img);

      // Cloudinary transformation (auto enhance + background cleanup + sharpen)
      const enhancedUrl = cloudinary.url(img.public_id, {
        transformation: [
          { quality: "auto", fetch_format: "auto" }, // best quality/format
          { effect: "improve" },                     // auto-enhance lighting/colors
          { effect: "sharpen" },                     // sharpen details
          { background: "white", crop: "pad" },      // clean background (pad to white)
        ],
        secure: true,
      });

      console.log("☁️ Generated enhanced Cloudinary URL:", enhancedUrl);

      enhancedPairs.push({
        original: img.url || img, // fallback if only url is stored
        enhanced: enhancedUrl,
      });
    }

    // Store in AiEnhancement collection
    const enhancement = await AiEnhancement.findOneAndUpdate(
      { productId: product._id },
      { enhancedImages: enhancedPairs },
      { upsert: true, new: true }
    );

    console.log("💾 Enhancement record updated in DB:", enhancement._id);

    res.json({
      productId: product._id,
      enhancedImages: enhancedPairs,
    });
  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    res.status(500).json({ error: "Image enhancement failed", details: err.message });
  }
});

module.exports = router;

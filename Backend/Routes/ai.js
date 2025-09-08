// routes/ai.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const Product = require("../models/product.js");
const AiEnhancement = require("../models/AiEnhancement.js");

// Google Gemini
const { GoogleGenAI, Modality } = require("@google/genai");

// Cloudinary
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // ✅ apni key env me rakho
});

/**
 * Enhance all product images using Gemini + upload to Cloudinary
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

      // Image ko local download karna (agar sirf URL hai)
      const imageUrl = img.url || img;
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const base64Image = buffer.toString("base64");

      // Prompt define karo
      const prompt = [
        { text: "Enhance this product image: improve lighting, sharpen details, and black background." },
        {
          inlineData: {
            mimeType: "image/png", // ya "image/jpeg" depending on input
            data: base64Image,
          },
        },
      ];

      // Gemini se enhanced image generate
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: prompt,
      });

      let cloudinaryUrl = null;

      for (const part of geminiResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          const enhancedBuffer = Buffer.from(part.inlineData.data, "base64");

          // ✅ Upload directly to Cloudinary
          cloudinaryUrl = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "gemini-enhanced" },
              (error, result) => {
                if (error) {
                  console.error("❌ Cloudinary upload error:", error);
                  reject(error);
                } else {
                  console.log("☁️ Uploaded to Cloudinary:", result.secure_url);
                  resolve(result.secure_url);
                }
              }
            );
            uploadStream.end(enhancedBuffer);
          });
        }
      }

      enhancedPairs.push({
        original: imageUrl,
        enhanced: cloudinaryUrl,
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

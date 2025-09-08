// routes/ai.js
const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const { VertexAI } = require("@google-cloud/vertexai");
const Product = require("../models/product.js");
const AiEnhancement = require("../models/AiEnhancement.js");

const router = express.Router();

// Function to add a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vertex AI config
const vertex = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
});

// Using a stable, versioned model that is generally available
const geminiFlash = vertex.getGenerativeModel({
  model: "gemini-2.0-flash-001",
});

/**
 * Enhance product images using Gemini and upload to Cloudinary
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
      console.log("🔄 Processing image:", img.url);

      // Implement a delay to avoid hitting the API quota
      await delay(2500); // 2.5 seconds

      try {
        // Use Gemini 2.0 Flash to enhance the image
        const result = await geminiFlash.generateContent({
          contents: [{
            role: "user",
            parts: [
              { text: "Enhance this product photo to look high-quality, professional, and ready for an e-commerce website." },
              {
                fileData: {
                  mimeType: "image/jpeg",
                  fileUri: img.url,
                },
              },
            ],
          }],
        });

        console.log("📥 Gemini API response received");

        const enhancedImageBase64 = result?.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!enhancedImageBase64) {
          console.error("⚠️ No enhanced image returned for:", img.url);
          continue;
        }

        // Upload the new, enhanced image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${enhancedImageBase64}`,
          {
            folder: "enhanced-products",
          }
        );

        console.log("☁️ Uploaded enhanced image to Cloudinary:", uploadResult.secure_url);

        enhancedPairs.push({
          original: img.url,
          enhanced: uploadResult.secure_url,
        });

      } catch (geminiError) {
        console.error("❌ Gemini Enhancement Error:", geminiError.message);
        continue;
      }
    }

    // Store the results in your database
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
    console.error("❌ General Enhancement Error:", err);
    res.status(500).json({ error: "Image enhancement failed", details: err.message });
  }
});

module.exports = router;
// routes/ai.js
const express = require("express");
const Product = require("../models/product.js");
const AiEnhancement = require("../models/AiEnhancement.js");
const { jsonrepair } = require("jsonrepair");
// Google Gemini
const { GoogleGenAI } = require("@google/genai");

// Cloudinary
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // ✅ from env
});

// 🔄 Retry helper
async function callGeminiWithRetry(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.warn(`⚠️ Gemini overloaded. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

// 🧹 JSON repair helper
function safeParseJSON(text) {
  try {
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) cleaned = match[0];
    const repaired = jsonrepair(cleaned);
    return JSON.parse(repaired);
  } catch (err) {
    console.error("❌ JSON parse failed:", err.message);
    return {};
  }
}

// 🔄 Normalize suggestions format
function normalizeSuggestions(suggestions) {
  const normalized = {};
  for (const [key, value] of Object.entries(suggestions)) {
    if (Array.isArray(value)) {
      normalized[key] = value.map((v) =>
        typeof v === "object" ? JSON.stringify(v) : String(v)
      );
    } else if (typeof value === "object") {
      normalized[key] = [JSON.stringify(value)];
    } else {
      normalized[key] = [String(value)];
    }
  }
  return normalized;
}

/**
 * Enhance product images + generate AI suggestions
 */
router.post("/enhance-image/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📌 Enhancing & suggesting for product ID:", id);

    const product = await Product.findById(id);
    if (!product) {
      console.error("❌ Product not found:", id);
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✅ Product found:", product._id, "with", product.images.length, "images");

    const enhancedPairs = [];
    let suggestions = null;
    let rawSuggestions = "";

    for (const img of product.images) {
      console.log("🔄 Processing image:", img);

      // Download image
      const imageUrl = img.url || img;
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const base64Image = buffer.toString("base64");

      /**
       * 1️⃣ Try Gemini enhancement (optional, may fail)
       */
      const promptEnhance = [
        {
          text: `Enhance this product image:
          - improve lighting
          - sharpen details
          - black background
          ⚠️ Return ONLY an enhanced image in base64 format (no text).`,
        },
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image,
          },
        },
      ];

      let geminiResponse;
      try {
        geminiResponse = await callGeminiWithRetry(() =>
          ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: promptEnhance,
          })
        );
      } catch (err) {
        console.error("❌ Gemini enhancement failed:", err.message);
        geminiResponse = null;
      }

      let cloudinaryUrl = null;

if (geminiResponse) {
  let foundImage = false;

  for (const part of geminiResponse.candidates[0].content.parts) {
    // 1. Agar Gemini ne inlineData diya
    if (part.inlineData?.data) {
      foundImage = true;
      const enhancedBuffer = Buffer.from(part.inlineData.data, "base64");

      cloudinaryUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "gemini-enhanced" },
          (error, result) => {
            if (error) return reject(error);
            console.log("☁️ Uploaded to Cloudinary:", result.secure_url);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(enhancedBuffer);
      });
    }

    // 2. Agar Gemini ne galti se base64 string text ke andar diya
    else if (part.text && /^[A-Za-z0-9+/=]+$/.test(part.text.trim())) {
      foundImage = true;
      console.log("⚠️ Gemini returned base64 as text, fixing...");
      const enhancedBuffer = Buffer.from(part.text.trim(), "base64");

      cloudinaryUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "gemini-enhanced" },
          (error, result) => {
            if (error) return reject(error);
            console.log("☁️ Uploaded to Cloudinary:", result.secure_url);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(enhancedBuffer);
      });
    }
  }

  // agar image nahi mili to fallback
  if (!foundImage || !cloudinaryUrl) {
    cloudinaryUrl = cloudinary.url(imageUrl, {
      effect: "improve",
      quality: "auto",
      background: "black",
      crop: "pad",
    });
    console.log("✨ Used Cloudinary fallback:", cloudinaryUrl);
  }
}


      enhancedPairs.push({
        original: imageUrl,
        enhanced: cloudinaryUrl,
      });

      /**
       * 3️⃣ Generate Suggestions (only once, use first image as reference)
       */
      if (!suggestions) {
        const promptForSuggestions = [
          {
            text: `Analyze this product image and description: "${product.description || ""}". 
            Suggest structured business insights in JSON format with these fields:
            platforms, targetAudience, geoMarkets, seasonalDemand, festivals, giftingOccasions,
            marketingChannels, contentIdeas, influencerMatch, hashtags, collaborationTips,
            crossSellUpsell, packagingIdeas, customerRetention, sustainabilityTips, costCuttingTips,
            competitorInsights, currentTrends, emotionalTriggers, colorPsychology, causeMarketing.
            `,
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image,
            },
          },
        ];

        try {
          const suggestionResponse = await callGeminiWithRetry(() =>
            ai.models.generateContent({
              model: "gemini-1.5-flash",
              contents: promptForSuggestions,
            })
          );

          const suggestionText =
            suggestionResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          rawSuggestions = suggestionText;

          suggestions = safeParseJSON(suggestionText);
          suggestions = normalizeSuggestions(suggestions);
          console.log("💡 Suggestions generated:", suggestions);
        } catch (err) {
          console.error("❌ Gemini suggestion failed:", err.message);
          suggestions = {};
        }
      }
    }

    // Save both enhanced images + suggestions + raw text
    const enhancement = await AiEnhancement.findOneAndUpdate(
      { productId: product._id },
      {
        $push: { enhancedImages: { $each: enhancedPairs } }, // ✅ append instead of overwrite
        suggestionsBox: suggestions,
        rawSuggestionsText: rawSuggestions,
      },
      { upsert: true, new: true }
    );

    console.log("💾 Enhancement + Suggestions saved:", enhancement._id);

    res.json({
      productId: product._id,
      enhancedImages: enhancedPairs,
      suggestionsBox: suggestions,
      rawSuggestionsText: rawSuggestions,
    });
  } catch (err) {
    console.error("❌ Enhance & Suggest Error:", err);
    res.status(500).json({ error: "Enhance & Suggest failed", details: err.message });
  }
});

module.exports = router;

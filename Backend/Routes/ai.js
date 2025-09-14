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
  apiKey: process.env.GEMINI_API_KEY,
});

// 🔄 Retry helper for Gemini API calls
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

// 🧹 Clean & extract JSON safely
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

// Normalize suggestions (always arrays)
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
 * ===============================
 * 1️⃣ Enhance Product Images
 * ===============================
 */
router.post("/enhance-image/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📌 Enhancing product ID:", id);

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const enhancedPairs = [];

    for (const img of product.images) {
      const imageUrl = img.url || img;
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const base64Image = buffer.toString("base64");

      const promptEnhance = [
        { text: "Enhance this product image: improve lighting, sharpen details, and black background." },
        {
          inlineData: { mimeType: "image/png", data: base64Image },
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
        continue;
      }

      let cloudinaryUrl = null;
      if (geminiResponse) {
        for (const part of geminiResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            const enhancedBuffer = Buffer.from(part.inlineData.data, "base64");
            cloudinaryUrl = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "gemini-enhanced" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                }
              );
              uploadStream.end(enhancedBuffer);
            });
          }
        }
      }

      enhancedPairs.push({ original: imageUrl, enhanced: cloudinaryUrl });
    }

    await AiEnhancement.findOneAndUpdate(
      { productId: product._id },
      { enhancedImages: enhancedPairs },
      { upsert: true, new: true }
    );

    res.json({ productId: product._id, enhancedImages: enhancedPairs });
  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    res.status(500).json({ error: "Image enhancement failed", details: err.message });
  }
});

/**
 * ===============================
 * 2️⃣ Generate AI Suggestions
 * ===============================
 */
router.post("/generate-suggestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("💡 Generating suggestions for product:", id);

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const imageUrl = product.images[0]?.url || product.images[0];
    if (!imageUrl) return res.status(400).json({ error: "No product image available" });

    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const promptForSuggestions = [
      {
        text: `Analyze this product image and description: "${product.description || ""}".
        Suggest structured business insights in JSON format with these fields:
        platforms, targetAudience, geoMarkets, seasonalDemand, festivals, giftingOccasions,
        marketingChannels, contentIdeas, influencerMatch, hashtags, collaborationTips,
        crossSellUpsell, packagingIdeas, customerRetention, sustainabilityTips, costCuttingTips,
        competitorInsights, currentTrends, emotionalTriggers, colorPsychology, causeMarketing.`,
      },
      { inlineData: { mimeType: "image/png", data: base64Image } },
    ];

    let suggestionResponse;
    try {
      suggestionResponse = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: promptForSuggestions,
        })
      );
    } catch (err) {
      console.error("❌ Gemini suggestion failed:", err.message);
      return res.status(500).json({ error: "Suggestion generation failed" });
    }

    const suggestionText =
      suggestionResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let suggestions = safeParseJSON(suggestionText);
    suggestions = normalizeSuggestions(suggestions);

    await AiEnhancement.findOneAndUpdate(
      { productId: product._id },
      { suggestionsBox: suggestions, rawSuggestionsText: suggestionText },
      { upsert: true, new: true }
    );

    res.json({ productId: product._id, suggestionsBox: suggestions, rawSuggestionsText: suggestionText });
  } catch (err) {
    console.error("❌ Suggestion Error:", err);
    res.status(500).json({ error: "Suggestion generation failed", details: err.message });
  }
});

module.exports = router;

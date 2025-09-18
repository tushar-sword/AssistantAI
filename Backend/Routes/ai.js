// routes/ai.js
const express = require("express");
const Product = require("../models/product.js");
const AiEnhancement = require("../models/AiEnhancement.js");
const { jsonrepair } = require("jsonrepair");
const { v2: cloudinary } = require("cloudinary");
const Groq = require("groq-sdk");

const router = express.Router();

/**
 * ===============================
 * Cloudinary Config
 * ===============================
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * ===============================
 * Groq Client
 * ===============================
 */
// Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function groqChat(prompt) {
  // Replace deprecated model with a valid one, e.g. "llama-3.1-8b-instant"
const response = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",  
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
  max_tokens: 1000,
});


  return response.choices[0]?.message?.content || "";
}


/**
 * ===============================
 * Safe JSON Parsing
 * ===============================
 */
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
 * 1️⃣ Enhance Product Images (Cloudinary)
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

      // Cloudinary auto enhancements
      const enhancedUrl = cloudinary.url(imageUrl, {
        effect: "improve",
        quality: "auto:best",
        fetch_format: "auto",
        transformation: [
          { effect: "sharpen" },
          { effect: "auto_color" },
          { background: "black" },
        ],
      });

      enhancedPairs.push({ original: imageUrl, enhanced: enhancedUrl });
    }

    await AiEnhancement.findOneAndUpdate(
      { productId: product._id },
      { enhancedImages: enhancedPairs },
      { upsert: true, new: true }
    );

    res.json({ productId: product._id, enhancedImages: enhancedPairs });
  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    res
      .status(500)
      .json({ error: "Image enhancement failed", details: err.message });
  }
});

/**
 * ===============================
 * 2️⃣ Generate AI Suggestions (Groq)
 * ===============================
 */
router.post("/generate-suggestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("💡 Generating suggestions for product:", id);

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const prompt = `
      Analyze this product description: "${product.description || ""}".
      Suggest structured business insights in JSON format with these fields:
      platforms, targetAudience, geoMarkets, seasonalDemand, festivals, giftingOccasions,
      marketingChannels, contentIdeas, influencerMatch, hashtags, collaborationTips,
      crossSellUpsell, packagingIdeas, customerRetention, sustainabilityTips, costCuttingTips,
      competitorInsights, currentTrends, emotionalTriggers, colorPsychology, causeMarketing.
      Return ONLY valid JSON.
    `;

    const suggestionText = await groqChat(prompt);

    if (!suggestionText.trim()) {
      throw new Error("Model returned empty response");
    }

    // Parse + normalize
    let suggestions = safeParseJSON(suggestionText);
    suggestions = normalizeSuggestions(suggestions);

    // Save to DB
    await AiEnhancement.findOneAndUpdate(
      { productId: product._id },
      { suggestionsBox: suggestions, rawSuggestionsText: suggestionText },
      { upsert: true, new: true }
    );
    console.log("✅ Suggestions generated and saved.");
    res.json({
      productId: product._id,
      suggestionsBox: suggestions,
      rawSuggestionsText: suggestionText,
    });
  } catch (err) {
    console.error("❌ Suggestion Error:", err);
    res.status(500).json({
      error: "Suggestion generation failed",
      details: err.message,
    });
  }
});

module.exports = router;

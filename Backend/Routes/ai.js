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

      // Extract Cloudinary public ID from URL
      // Example: https://res.cloudinary.com/<cloud>/image/upload/v12345/folder/img.jpg
      // → publicId = folder/img
      const urlParts = imageUrl.split("/");
      const versionIndex = urlParts.findIndex(part => part.startsWith("v"));
      const publicIdWithExt = urlParts.slice(versionIndex + 1).join("/"); // e.g., folder/img.jpg
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension

      // Generate enhanced URLs for each artistic effect
      const enhancedVariants = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/e_art:quartz/${publicId}`
      enhancedPairs.push({ original: imageUrl, enhanced: enhancedVariants });
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
 * 2️⃣ Generate AI Suggestions (Groq)
 * ===============================
 */
function mapToSchemaFields(suggestions) {
  return {
    suggestedTitles: suggestions.suggestedTitles || [],
    suggestedDescriptions: suggestions.descriptions || [], // map correctly
    suggestedTags: suggestions.productTags || [],
    suggestedPrices: (suggestions.priceInRupees || []).map(p => Number(p)),

    suggestionsBox: {
      platforms: suggestions.platforms || [],
      targetAudience: suggestions.targetAudiences || [],
      geoMarkets: suggestions.geoMarkets || [],
      seasonalDemand: suggestions.seasonalDemand || [],
      festivals: suggestions.festivals || [],
      giftingOccasions: suggestions.giftingOccasions || [],
      marketingChannels: suggestions.marketingChannels || [],
      contentIdeas: suggestions.contentIdeas || [],
      influencerMatch: suggestions.influencerMatches || [], // map correctly
      hashtags: suggestions.hashtags || [],
      collaborationTips: suggestions.collaborationTips || [],
      crossSellUpsell: suggestions.crossSellUpsell || [],
      packagingIdeas: suggestions.packagingIdeas || [],
      customerRetention: suggestions.customerRetention || [],
      sustainabilityTips: suggestions.sustainabilityTips || [],
      costCuttingTips: suggestions.costCuttingTips || [],
      competitorInsights: suggestions.competitorInsights || [],
      currentTrends: suggestions.currentTrends || [],
      emotionalTriggers: suggestions.emotionalTriggers || [],
      colorPsychology: suggestions.colorPsychology || [],
      causeMarketing: suggestions.causeMarketing || [],
    }
  };
}

router.post("/generate-suggestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("💡 Generating suggestions for product:", id);

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const prompt = `
      Analyze this product description: "${product.title}:${product.description || ""}".
      Suggest structured business insights in JSON format with these fields:
      suggested titles, descriptions, product tags, price in rupees, categories, platforms, targetAudiences, geoMarkets, seasonalDemand, festivals, giftingOccasions,
      marketingChannels, contentIdeas, influencerMatches, hashtags, collaborationTips,
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
    console.log(suggestions)
    // Save to DB
    const mappedSuggestions = mapToSchemaFields(suggestions);

await AiEnhancement.findOneAndUpdate(
  { productId: product._id },
  { 
    $set: {
      ...mappedSuggestions,
      rawSuggestionsText: suggestionText,
    }
  },
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
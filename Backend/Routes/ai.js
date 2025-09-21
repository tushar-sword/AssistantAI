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

<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
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
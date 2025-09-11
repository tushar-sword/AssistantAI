const mongoose = require("mongoose");

const aiEnhancementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Enhanced Images
    enhancedImages: [
      {
        original: { type: String, required: true },
        enhanced: { type: String, required: true },
      },
    ],

    // Other AI suggestions
    suggestedTitles: [String],
    suggestedDescriptions: [String],
    suggestedPrices: [Number],
    suggestedTags: [String],

    // Structured Suggestion Box
    suggestionsBox: {
      platforms: [String],
      targetAudience: [String],
      geoMarkets: [String],
      seasonalDemand: [{}],
      festivals: [String],
      giftingOccasions: [String],
      marketingChannels: [String],
      contentIdeas: [String],
      influencerMatch: [String],
      hashtags: [String],
      collaborationTips: [String],
      crossSellUpsell: [String],
      packagingIdeas: [String],
      customerRetention: [String],
      sustainabilityTips: [String],
      costCuttingTips: [String],
      competitorInsights: [String],
      currentTrends: [String],
      emotionalTriggers: [String],
      colorPsychology: [String],
      causeMarketing: [String],
    },

    // 🔑 Fallback field in case JSON parse fails
    rawSuggestionsText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiEnhancement", aiEnhancementSchema);

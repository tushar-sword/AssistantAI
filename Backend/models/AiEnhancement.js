const mongoose = require("mongoose");

const aiEnhancementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    enhancedImages: [
      {
        original: { type: String, required: true },
        enhanced: { type: String, required: true },
      },
    ],
    suggestedTitles: [
      {
        type: String,
      },
    ],
    suggestedDescriptions: [
      {
        type: String,
      },
    ],
    suggestedPrices: [
      {
        type: Number, 
      },
    ],
    suggestedTags: [
      {
        type: String,
      },
    ],
    suggestionsBox: {
      platforms: [String],
      costTips: [String],
      audience: [String],
      variants: [String],
      promotion: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiEnhancement", aiEnhancementSchema);

// models/AiContent.js
const mongoose = require("mongoose");

const aiContentSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // AI-generated content per platform
    content: {
      Instagram: {
        type: Object,
        default: {},
      },
      Facebook: {
        type: Object,
        default: {},
      },
      WhatsApp: {
        type: Object,
        default: {},
      },
      Twitter: {
        type: Object,
        default: {},
      },
    },

    // Raw response text from AI model (fallback)
    rawText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiContent", aiContentSchema);

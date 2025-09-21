// models/AiContent.js
const mongoose = require("mongoose");

const AiContentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  captions: {
    instagram: [String],
    facebook: [String],
    whatsapp: [String],
  },
  rawResponse: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AiContent", AiContentSchema);
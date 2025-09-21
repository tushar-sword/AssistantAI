// controllers/aiContentController.js
const Product = require("../models/product");
const AiContent = require("../models/AiContent");
const { generateCaptionsFromImage } = require("../utils/groq");

/**
 * Normalize raw JSON output from Groq into structured captions
 */
const normalizeCaptions = (rawText) => {
  try {
    const clean = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      instagram: parsed.Instagram || [],
      facebook: parsed.Facebook || [],
      whatsapp: parsed.WhatsApp || [],
    };
  } catch (err) {
    console.error("⚠️ Caption parse error:", err.message);
    return { instagram: [], facebook: [], whatsapp: [] };
  }
};

/**
 * POST /api/ai-content/generate/:productId
 * Generates AI captions for a product and saves them in DB
 */
exports.generateForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ✅ Call correct Groq util function
    const result = await generateCaptionsFromImage(product);

    // Normalize captions for DB
    const captions = normalizeCaptions(result.raw);

    let aiContent = await AiContent.findOne({ productId });
    if (!aiContent) {
      aiContent = new AiContent({
        productId,
        captions,
        rawResponse: result.raw,
      });
    } else {
      aiContent.captions = captions;
      aiContent.rawResponse = result.raw;
      aiContent.updatedAt = new Date();
    }

    await aiContent.save();

    return res.json({
      success: true,
      message: "AI content generated successfully",
      productId,
      captions,
    });
  } catch (err) {
    console.error("❌ generateForProduct error:", err);
    res.status(500).json({
      success: false,
      message: "AI content generation failed",
      error: err.message,
    });
  }
};

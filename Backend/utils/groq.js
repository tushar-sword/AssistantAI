// utils/groq.js
const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY not set. Groq calls will fail.");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate captions from product details (no image, text only).
 * Returns { captions: { Instagram, Facebook, WhatsApp }, raw: rawResponse }
 */
async function generateCaptionsFromImage(product) {
  try {
    console.log("🧠 Groq: starting caption generation for product:", product.name);

    const prompt = `
      You are a social media expert.
      Generate three short captions for each platform: Instagram, Facebook, and WhatsApp.

      Product Details:
      - Name: ${product.name}
      - Category: ${product.category}
      - Price: ₹${product.price}
      - Description: ${product.description}

      Rules:
      - Instagram: trendy, catchy, add 1-2 hashtags.
      - Facebook: conversational, add a call-to-action (like "Shop Now").
      - WhatsApp: short, one-liner, suitable for quick share.

      Return ONLY a valid JSON in the format:
      {
        "Instagram": ["caption1", "caption2", "caption3"],
        "Facebook": ["caption1", "caption2", "caption3"],
        "WhatsApp": ["caption1", "caption2", "caption3"]
      }
    `;

    const resp = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // fast + cheap model
      messages: [
        { role: "system", content: "You are a creative caption generator." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    console.log("📡 Groq raw response:", JSON.stringify(resp, null, 2));

    let assistantText = resp?.choices?.[0]?.message?.content || "";

    // cleanup if wrapped in code blocks
    assistantText = assistantText.trim();
    assistantText = assistantText.replace(/^\s*```(?:json)?\s*/, "").replace(/\s*```\s*$/, "");

    let parsed = null;
    try {
      parsed = JSON.parse(assistantText);
    } catch (err) {
      console.warn("⚠️ JSON parse error:", err.message);
    }

    if (parsed) {
      return { captions: parsed, raw: assistantText, rawResponse: resp };
    } else {
      return { captions: null, raw: assistantText, rawResponse: resp };
    }
  } catch (err) {
    console.error("❌ Groq caption generation failed:", err);
    throw err;
  }
}

module.exports = { generateCaptionsFromImage };

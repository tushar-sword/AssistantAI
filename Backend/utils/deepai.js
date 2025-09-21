const axios = require("axios");

if (!process.env.DEEPAI_API_KEY) {
  console.warn("⚠️ DEEPAI_API_KEY not set. DeepAI calls will fail.");
}

async function generateImageFromText(prompt) {
  console.log("🧠 Calling DeepAI with prompt:", prompt);

  try {
    const res = await axios.post(
      "https://api.deepai.org/api/text2img",
      new URLSearchParams({ text: prompt }),
      {
        headers: {
          "api-key": process.env.DEEPAI_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 120000,
      }
    );

    console.log("📡 DeepAI raw response:", res.data);

    if (res.data.output_url) return res.data.output_url;
    if (res.data.output && Array.isArray(res.data.output) && res.data.output[0]) {
      return res.data.output[0];
    }

    throw new Error("Unexpected DeepAI response: " + JSON.stringify(res.data));
  } catch (err) {
    console.error("❌ DeepAI generate failed:", err.response?.data || err.message);
    throw new Error("DeepAI generate failed: " + (err.response?.data?.err || err.message));
  }
}

module.exports = { generateImageFromText };
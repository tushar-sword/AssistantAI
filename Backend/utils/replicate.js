const Replicate = require("replicate");
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Generate image using Google Imagen 4
 * Returns image URL
 */
async function generateImageFromText(prompt) {
  console.log("🧠 Calling Replicate (Google Imagen 4) with prompt:", prompt);

  try {
    const output = await replicate.run(
      "google/imagen-4-fast",
      { input: { prompt, width: 1024, height: 1024 } }
    );

    console.log("📡 Replicate output:", output);

    if (!output || !Array.isArray(output) || !output[0]) {
      throw new Error("Invalid Replicate response");
    }

    return output[0]; // image URL
  } catch (err) {
    console.error("❌ Replicate generate failed:", err.message);
    throw new Error("Replicate generate failed: " + err.message);
  }
}

module.exports = { generateImageFromText };

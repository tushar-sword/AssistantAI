// routes/ai.js
const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const { VertexAI } = require("@google-cloud/vertexai");
const Product = require("../models/product.js");
const AiEnhancement = require("../models/AiEnhancement.js");

const router = express.Router();



// Cloudinary config (already using env variables)
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
const imagen = vertex.getGenerativeModel({ model: "imagen-3.0-generate-001" });

/**
 * Enhance all product images and store original-enhanced pairs
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
      console.log("🔄 Processing image:", img);

      // Enhance using Imagen
      const result = await imagen.generateContent({
        prompt:
          "Enhance this product photo to look high-quality, professional for e-commerce.",
        image: { uri: img },
      });

      console.log("📥 Imagen API response received");

      const base64Img = result?.candidates?.[0]?.content?.parts?.[0]?.image?.base64;

      if (!base64Img) {
        console.error("⚠️ No base64 image returned for:", img);
        continue;
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(
        `data:image/png;base64,${base64Img}`,
        { folder: "enhanced-products" }
      );

      console.log("☁️ Uploaded enhanced image to Cloudinary:", uploadResult.secure_url);

      enhancedPairs.push({
        original: img,
        enhanced: uploadResult.secure_url,
      });
    }

    // Store in AiEnhancement collection
    const enhancement = await AiEnhancement.findOneAndUpdate(
      { productId: product._id },
      { enhancedImages: enhancedPairs },
      { upsert: true, new: true }
    );

    console.log("💾 Enhancement record updated in DB:", enhancement._id);

    res.json({
  productId: product._id,
  enhancedImages: enhancedPairs,
});
  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    res.status(500).json({ error: "Image enhancement failed", details: err.message });
  }
});

module.exports = router;



// Will Look into this later  ------------------------------------------------------------------------

// // change this file to use require in place of import 


// import express from "express";
// import { VertexAI } from "@google-cloud/vertexai";
// const router = express.Router();

// const vertex = new VertexAI({ project: "your-project-id", location: "us-central1" });
// const imagen = vertex.getGenerativeModel({ model: "imagen-3.0" });

// router.post("/enhance-image", async (req, res) => {
//  try {
//  const { imageUrl } = req.body;

//  const result = await imagen.generateContent({
//     // 5 product -- same prompt donot similar ai genration hrrr , 
//     // user ai - automation - prompt / 
//     // prompt - drop common prompt or dynamic prompt
//     // prompt dervied description product 
//     // prompt structure ? 

//     // derive prompt / option + dynamic prompt 



//  // Prompt to improve image (lighting, background cleanup, professional look) // same ? option or dynamic
//  prompt: `Enhance this product photo to look high-quality and professional for an e-commerce
// website.`, 

//  image: { uri: imageUrl }

//  });

// // Extract the enhanced image URL from the response - why oth index 
//  const enhancedImage = result.candidates[0].content.parts[0].image.base64;

//  res.json({ enhancedImage });
//   } catch (err) {
//  console.error(err);
//  res.status(500).json({ error: "Image enhancement failed" });
//  }
// });

// export default router;




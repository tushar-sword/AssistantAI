// routes/ai.js
const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const { VertexAI } = require("@google-cloud/vertexai");
const Product = require("../models/product.js");
const AiEnhancement = require("../models/AiEnhancement.js");
const {
  GoogleAuth
} = require('google-auth-library');

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

// Correct model name for image generation
const imagen = vertex.getGenerativeModel({
  model: "imagegeneration@006"
});

/**
 * Helper function to add delay between requests
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced function with retry logic and exponential backoff
 */
async function enhanceImageWithRetry(imageUrl, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1} for image: ${imageUrl}`);
      
      const result = await imagen.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: "Enhance this product photo to look high-quality, professional for e-commerce. Improve lighting, colors, and overall visual appeal while maintaining the product's authenticity."
          }, {
            fileData: {
              mimeType: "image/jpeg",
              fileUri: imageUrl,
            },
          }],
        }],
      });

      console.log("✅ Imagen API response received successfully");
      return result;

    } catch (error) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
      
      if (error.code === 429 || error.status === 'RESOURCE_EXHAUSTED') {
        if (attempt < maxRetries - 1) {
          // Exponential backoff: 2s, 4s, 8s, etc.
          const waitTime = Math.pow(2, attempt + 1) * 1000;
          console.log(`⏳ Rate limit hit. Waiting ${waitTime / 1000}s before retry...`);
          await delay(waitTime);
        } else {
          throw new Error(`Rate limit exceeded after ${maxRetries} attempts. Please try again later.`);
        }
      } else {
        // For non-rate-limit errors, throw immediately
        throw error;
      }
    }
  }
}

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
      return res.status(404).json({
        error: "Product not found"
      });
    }

    console.log("✅ Product found:", product._id, "with", product.images.length, "images");

    if (product.images.length === 0) {
      return res.status(400).json({
        error: "No images found for this product"
      });
    }

    const enhancedPairs = [];
    const failedImages = [];

    // Process images sequentially with delays to avoid rate limits
    for (let i = 0; i < product.images.length; i++) {
      const img = product.images[i];
      console.log(`🔄 Processing image ${i + 1}/${product.images.length}:`, img.url);

      try {
        // Add delay between requests (except for the first one)
        if (i > 0) {
          console.log("⏳ Waiting 3 seconds before next request...");
          await delay(3000); // 3 second delay between requests
        }

        // Enhance using Imagen with retry logic
        const result = await enhanceImageWithRetry(img.url);

        const base64Img = result?.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Img) {
          console.error("⚠️ No base64 image returned for:", img.url);
          failedImages.push({
            original: img.url,
            error: "No enhanced image data returned"
          });
          continue;
        }

        // Upload to Cloudinary
        console.log("☁️ Uploading enhanced image to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Img}`, 
          {
            folder: "enhanced-products",
            public_id: `enhanced_${img.public_id || Date.now()}`
          }
        );

        console.log("✅ Uploaded enhanced image:", uploadResult.secure_url);

        enhancedPairs.push({
          original: img.url,
          originalPublicId: img.public_id,
          enhanced: uploadResult.secure_url,
          enhancedPublicId: uploadResult.public_id,
        });

      } catch (error) {
        console.error(`❌ Failed to enhance image ${img.url}:`, error.message);
        failedImages.push({
          original: img.url,
          error: error.message
        });
        
        // If it's a rate limit error, add longer delay before continuing
        if (error.message.includes('Rate limit')) {
          console.log("⏳ Adding extra delay due to rate limit...");
          await delay(10000); // 10 second delay after rate limit error
        }
      }
    }

    // Store in AiEnhancement collection
    if (enhancedPairs.length > 0) {
      const enhancement = await AiEnhancement.findOneAndUpdate(
        { productId: product._id },
        { 
          enhancedImages: enhancedPairs,
          lastUpdated: new Date(),
          totalEnhanced: enhancedPairs.length,
          totalFailed: failedImages.length
        },
        { upsert: true, new: true }
      );

      console.log("💾 Enhancement record updated in DB:", enhancement._id);
    }

    // Return response with both successful and failed enhancements
    const response = {
      productId: product._id,
      totalImages: product.images.length,
      successfulEnhancements: enhancedPairs.length,
      failedEnhancements: failedImages.length,
      enhancedImages: enhancedPairs,
    };

    if (failedImages.length > 0) {
      response.failures = failedImages;
      response.message = `Enhanced ${enhancedPairs.length} out of ${product.images.length} images. Some images failed to enhance.`;
    } else {
      response.message = `Successfully enhanced all ${enhancedPairs.length} images.`;
    }

    res.json(response);

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    res.status(500).json({
      error: "Image enhancement failed",
      details: err.message,
      suggestion: "This might be due to API rate limits. Please try again in a few minutes."
    });
  }
});

/**
 * Get enhancement status for a product
 */
router.get("/enhancement-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const enhancement = await AiEnhancement.findOne({ productId: id });
    
    if (!enhancement) {
      return res.status(404).json({
        error: "No enhancement record found for this product"
      });
    }
    
    res.json({
      productId: id,
      enhancementId: enhancement._id,
      totalEnhanced: enhancement.totalEnhanced || enhancement.enhancedImages.length,
      totalFailed: enhancement.totalFailed || 0,
      lastUpdated: enhancement.lastUpdated,
      enhancedImages: enhancement.enhancedImages
    });
    
  } catch (err) {
    console.error("❌ Get Enhancement Status Error:", err);
    res.status(500).json({
      error: "Failed to get enhancement status",
      details: err.message
    });
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




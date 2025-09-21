const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFromUrl(url, folder = "ai-generated") {
  console.log("☁️ Uploading to Cloudinary from URL:", url);

  try {
    const res = await cloudinary.uploader.upload(url, {
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    console.log("✅ Cloudinary upload success:", res.secure_url);
    return res;
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err.message);
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
}

module.exports = { cloudinary, uploadFromUrl };
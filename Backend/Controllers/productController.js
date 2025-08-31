const Product = require("../models/product");

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // ✅ Handle images from Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: file.path,          // Cloudinary secure URL
        public_id: file.filename // optional: store public_id for deletion
      }));
    }

    const product = new Product({
      name,
      price,
      category,
      description,
      images,
      user: req.user._id, // from auth middleware
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("❌ Error in createProduct:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("user", "name email");
    res.json(products);
  } catch (error) {
    console.error("❌ Error in getProducts:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("❌ Error in getProductById:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};

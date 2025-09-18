import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchProductById,
  enhanceProductImage,
} from "../../src/Redux/productSlice";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    selectedProduct: product,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.products);

  const [mainImage, setMainImage] = useState("");

  // ✅ Fetch product by ID
  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  // ✅ Set main image initially
  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImage(product.images[0].url);
    }
  }, [product]);

  // ✅ Handle AI Enhancement
  const handleEnhance = () => {
    if (product?._id) {
      dispatch(enhanceProductImage(product._id));
    }
  };

  if (isLoading) return <p className="loading">Loading product...</p>;
  if (isError) return <p className="error">{message}</p>;
  if (!product) return <p className="no-product">Product not found</p>;

  return (
    <>
      <Navbar />
      <div className="product-detail-container">
        {/* Left Side - Images */}
        <div className="image-gallery">
          <div className="thumbnails">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`${product.name}-${index}`}
                onClick={() => setMainImage(img.url)}
                className={mainImage === img.url ? "active" : ""}
              />
            ))}
          </div>
          <div className="main-image">
            <img src={mainImage} alt={product.name} />
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="price">₹{product.price}</p>
          <p className="category">Category: {product.category}</p>
          <p className="description">{product.description}</p>

          <div className="button-row">
            <button className="buy-btn">Buy Now</button>
            <button className="add-cart-btn">Add to Cart</button>
            <button className="enhance-ai-btn" onClick={handleEnhance}>
              Enhance AI💡
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetailPage;

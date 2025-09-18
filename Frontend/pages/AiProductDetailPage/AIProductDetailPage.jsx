import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchAiProductById,
  generateAiSuggestions,
} from "../../src/Redux/aiProductSlice";

import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import SuggestionBox from "../../src/components/SuggestionBox/SuggestionBox";

import "./AIProductDetailPage.css";

const AIProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    selectedAiProduct: aiProduct,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.aiProducts);

  const [mainImage, setMainImage] = useState("");

  // ✅ Fetch AI Enhanced Product by ID
  useEffect(() => {
    dispatch(fetchAiProductById(id));
  }, [dispatch, id]);

  // ✅ Set main image initially
  useEffect(() => {
    if (aiProduct?.aiEnhancement?.enhancedImages?.length > 0) {
      setMainImage(aiProduct.aiEnhancement.enhancedImages[0].enhanced);
    } else if (aiProduct?.product?.images?.length > 0) {
      setMainImage(aiProduct.product.images[0].url);
    }
  }, [aiProduct]);

  // ✅ Handle Suggestions
  const handleGenerateSuggestions = () => {
    if (aiProduct?.product?._id) {
      dispatch(generateAiSuggestions(aiProduct.product._id));
    }
  };

  if (isLoading) return <p className="ai-loading">Loading AI product...</p>;
  if (isError) return <p className="ai-error">{message}</p>;
  if (!aiProduct) return <p className="ai-no-product">AI Product not found</p>;

  return (
    <>
      <Navbar />
      <div className="ai-product-detail-container">
        {/* Left Side - Images */}
        <div className="ai-image-gallery">
          <div className="ai-main-image">
            {mainImage ? (
              <img src={mainImage} alt={aiProduct.product.name} />
            ) : (
              <p>No image available</p>
            )}
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="ai-product-info">
          <h2>{aiProduct.product.name}</h2>
          <p className="ai-price">₹{aiProduct.product.price}</p>
          <p className="ai-category">Category: {aiProduct.product.category}</p>
          <p className="ai-description">{aiProduct.product.description}</p>

          <div className="ai-button-row">
            <button className="ai-buy-btn">Buy Now</button>
            <button className="ai-add-cart-btn">Add to Cart</button>
            <button
              className="ai-suggestion-btn"
              onClick={handleGenerateSuggestions}
            >
              Generate Suggestions 🤖
            </button>
          </div>
        </div>
      </div>

      {/* 🔮 AI Suggestions Section */}
      <SuggestionBox suggestions={aiProduct?.aiEnhancement?.suggestions} />

      <Footer />
    </>
  );
};

export default AIProductDetailPage;

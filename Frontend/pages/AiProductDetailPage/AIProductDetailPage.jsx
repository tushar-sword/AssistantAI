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

import { FiCopy } from "react-icons/fi";

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
  const [copiedField, setCopiedField] = useState("");

  // Fetch AI Enhanced Product by id
  useEffect(() => {
    dispatch(fetchAiProductById(id));
  }, [dispatch, id]);

  // Set main image initially
  useEffect(() => {
    if (aiProduct?.aiEnhancement?.enhancedImages?.length > 0) {
      setMainImage(aiProduct.aiEnhancement.enhancedImages[0].enhanced);
    } else if (aiProduct?.product?.images?.length > 0) {
      setMainImage(aiProduct.product.images[0].url);
    }
  }, [aiProduct]);

  // Handle Suggestions
  const handleGenerateSuggestions = () => {
    if (aiProduct?.product?._id) {
      dispatch(generateAiSuggestions(aiProduct.product._id));
    }
  };

  // Download Image
  const handleDownloadImage = () => {
    if (!mainImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = mainImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `${aiProduct?.product?.name || "ai-image"}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    };
  };

  // Copy to clipboard
  const handleCopy = (text, field) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    });
  };

  if (isLoading) return <p className="ai-loading">Loading AI product...</p>;
  if (isError) return <p className="ai-error">{message}</p>;
  if (!aiProduct) return <p className="ai-no-product">AI Product not found</p>;

  const enhancement = aiProduct.aiEnhancement || {};

  return (
    <>
      <Navbar />
      <div className="ai-product-detail-container">
        {/* Left Side - Images */}
        <div className="ai-image-gallery">
          <div className="ai-main-image">
            {mainImage ? (
              <>
                <img
                  src={mainImage}
                  alt={aiProduct.product.name}
                  crossOrigin="anonymous"
                />
                <button
                  className="ai-download-btn"
                  onClick={handleDownloadImage}
                >
                  Download Image
                </button>
              </>
            ) : (
              <p>No image available</p>
            )}
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="ai-product-info">
          {/* Product Title */}
          <h2>
            {aiProduct.product.name}
            <button
              className="ai-copy-btn"
              onClick={() => handleCopy(aiProduct.product.name, "title")}
              aria-label="Copy product title"
            >
              <FiCopy size={18} />
            </button>
            {copiedField === "title" && (
              <span className="copied-msg">Copied!</span>
            )}
          </h2>

          {/* Suggested Titles Dropdown */}
          {enhancement.suggestedTitles?.length > 0 && (
            <div className="ai-suggested-titles">
              <label htmlFor="suggestedTitle">Suggested Titles:</label>
              <select
                id="suggestedTitle"
                onChange={(e) => handleCopy(e.target.value, "suggestedTitle")}
              >
                <option value="">-- Select a title --</option>
                {enhancement.suggestedTitles.map((title, idx) => (
                  <option key={idx} value={title}>
                    {title}
                  </option>
                ))}
              </select>
              {copiedField === "suggestedTitle" && (
                <span className="copied-msg">Copied!</span>
              )}
            </div>
          )}

          <p className="ai-price">₹{aiProduct.product.price}</p>
          <p className="ai-category">Category: {aiProduct.product.category}</p>

          {/* Product Description */}
          <p className="ai-description">
            {aiProduct.product.description}
            <button
              className="ai-copy-btn"
              onClick={() =>
                handleCopy(aiProduct.product.description, "description")
              }
              aria-label="Copy description"
            >
              <FiCopy size={18} />
            </button>
            {copiedField === "description" && (
              <span className="copied-msg">Copied!</span>
            )}
          </p>

          {/* Suggested Descriptions Dropdown */}
          {enhancement.suggestedDescriptions?.length > 0 && (
            <div className="ai-suggested-descriptions">
              <label htmlFor="suggestedDesc">Suggested Descriptions:</label>
              <select
                id="suggestedDesc"
                onChange={(e) =>
                  handleCopy(e.target.value, "suggestedDescription")
                }
              >
                <option value="">-- Select a description --</option>
                {enhancement.suggestedDescriptions.map((desc, idx) => (
                  <option key={idx} value={desc}>
                    {desc.length > 60 ? desc.slice(0, 57) + "..." : desc}
                  </option>
                ))}
              </select>
              {copiedField === "suggestedDescription" && (
                <span className="copied-msg">Copied!</span>
              )}
            </div>
          )}

          {/* Suggested Tags */}
          {enhancement.suggestedTags?.length > 0 && (
            <div className="ai-tags">
              <h4>Suggested Tags:</h4>
              <ul className="ai-tag-list">
                {enhancement.suggestedTags.map((tag, idx) => (
                  <li key={idx} className="ai-tag">
                    #{tag}
                    <button
                      className="ai-copy-btn"
                      onClick={() => handleCopy(tag, `tag-${idx}`)}
                      aria-label={`Copy tag ${tag}`}
                    >
                      <FiCopy size={14} />
                    </button>
                    {copiedField === `tag-${idx}` && (
                      <span className="copied-msg">Copied!</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

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

      {/* AI Suggestions Section */}
      <SuggestionBox
        suggestionsBox={enhancement.suggestionsBox ?? enhancement.suggestions}
      />

      <Footer />
    </>
  );
};

export default AIProductDetailPage;

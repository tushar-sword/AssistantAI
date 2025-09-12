import React from "react";
import { Link } from "react-router-dom";
import "./AIProductCard.css";

const AIProductCard = ({ product, aiEnhancement }) => {
  // ✅ Prefer AI enhanced image, fallback to original
  const imageUrl =
    aiEnhancement?.enhancedImages?.length > 0
      ? aiEnhancement.enhancedImages[0].enhanced
      : product.images?.[0]?.url;

  return (
    <Link to={`/ai-products/${product._id}`} className="ai-product-card">
      <div className="ai-product-image">
        <img src={imageUrl} alt={product.name} />
      </div>
      <div className="ai-product-info">
        <h3>{product.name}</h3>
        <p className="price">₹{product.price}</p>
        <p className="category">{product.category}</p>
        {aiEnhancement?.enhancedImages?.length > 0 && (
          <p className="ai-label">✨ AI Enhanced</p>
        )}
      </div>
    </Link>
  );
};

export default AIProductCard;

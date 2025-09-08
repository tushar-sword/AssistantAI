import React from "react";
import { Link } from "react-router-dom";
import "./AIProductCard.css";

const AIProductCard = ({ product }) => {
  // ✅ pick enhanced image first, fallback to original
  const imageUrl =
    product.enhancedImages?.length > 0
      ? product.enhancedImages[0].enhanced
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
        {product.enhancedImages?.length > 0 && (
          <p className="ai-label">✨ AI Enhanced</p>
        )}
      </div>
    </Link>
  );
};

export default AIProductCard;

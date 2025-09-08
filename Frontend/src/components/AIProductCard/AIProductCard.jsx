import React from "react";
import { useDispatch } from "react-redux";
import { enhanceProductImage } from "../../Redux/productSlice";

import "./AIProductCard.css";

const AIProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleEnhance = () => {
    dispatch(enhanceProductImage(product._id));
  };

  return (
    <div className="ai-product-card">
      <h3 className="ai-product-name">{product.name}</h3>

      {/* If product has AI-enhanced images */}
      {product.enhancedImages && product.enhancedImages.length > 0 ? (
        <div className="ai-images-wrapper">
          {product.enhancedImages.map((pair, index) => (
            <div key={index} className="ai-image-pair">
              <div className="ai-image-block">
                <img
                  src={pair.original}
                  alt="Original"
                  className="ai-product-img"
                />
                <p className="ai-label">Original</p>
              </div>
              <div className="ai-image-block">
                <img
                  src={pair.enhanced}
                  alt="Enhanced"
                  className="ai-product-img"
                />
                <p className="ai-label">Enhanced</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-enhancement">
          <p>No AI enhancement available</p>
          <button className="ai-enhance-btn" onClick={handleEnhance}>
            Enhance Now
          </button>
        </div>
      )}
    </div>
  );
};

export default AIProductCard;

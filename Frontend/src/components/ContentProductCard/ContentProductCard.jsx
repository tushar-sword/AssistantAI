// src/components/ContentProductCard/ContentProductCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { generateContentForProduct } from "../../Redux/contentSlice";
import "./ContentProductCard.css";

const ContentProductCard = ({ product, aiEnhancement }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading: contentLoading } = useSelector((state) => state.content);

  const imageUrl =
    aiEnhancement?.enhancedImages?.length > 0
      ? aiEnhancement.enhancedImages[0].enhanced
      : product?.images?.[0]?.url;

  const handleGenerateContent = async () => {
    if (!product?._id) return;
    const resultAction = await dispatch(generateContentForProduct(product._id));
    if (generateContentForProduct.fulfilled.match(resultAction)) {
      navigate(`/ai-content/${product._id}/content`);
    }
  };

  return (
    <div className="content-card">
      <Link to={`/ai-content/${product?._id}/details`} className="content-thumb">
        <img src={imageUrl} alt={product?.name} />
      </Link>

      <div className="content-card-body">
        <h3 className="content-name">{product?.name}</h3>
        <p className="content-short">{product?.description}</p>

        <div className="content-meta">
          <span className="price">₹{product?.price}</span>
          <p className="category">{product?.category}</p>
          {aiEnhancement?.enhancedImages?.length > 0 && (
            <span className="ai-label">✨ AI Enhanced</span>
          )}
        </div>

        <div className="card-actions">
          <Link
            to={`/ai-content/${product?._id}/details`}
            className="btn btn-outline"
          >
            View Details
          </Link>
          <button
            onClick={handleGenerateContent}
            className="btn btn-primary"
            disabled={contentLoading}
          >
            {contentLoading ? "Generating..." : "Generate Content"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentProductCard;

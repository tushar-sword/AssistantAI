// src/pages/ContentProductDetails/ContentProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAiProductById } from "../../src/Redux/aiProductSlice";
import { generateContentForProduct } from "../../src/Redux/contentSlice";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import { FiCopy } from "react-icons/fi";
import "./ContentProductDetails.css";

const ContentProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedAiProduct: aiProduct, isLoading, isError, message } =
    useSelector((state) => state.aiProducts);
  const { isLoading: contentLoading } = useSelector((state) => state.content);

  const [mainImage, setMainImage] = useState("");
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    dispatch(fetchAiProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (aiProduct?.aiEnhancement?.enhancedImages?.length > 0) {
      setMainImage(aiProduct.aiEnhancement.enhancedImages[0].enhanced);
    } else if (aiProduct?.product?.images?.length > 0) {
      setMainImage(aiProduct.product.images[0].url);
    }
  }, [aiProduct]);

  const handleCopy = (text, field) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    });
  };

  const handleGenerateContent = async () => {
    if (!aiProduct?.product?._id) return;
    const resultAction = await dispatch(
      generateContentForProduct(aiProduct.product._id)
    );
    if (generateContentForProduct.fulfilled.match(resultAction)) {
      navigate(`/ai-content/${aiProduct.product._id}/content`);
    }
  };

  if (isLoading) return <p className="content-loading">Loading product...</p>;
  if (isError) return <p className="content-error">{message}</p>;
  if (!aiProduct?.product) return <p className="content-no-product">Product not found</p>;

  return (
    <>
      <Navbar />
      <div className="content-detail-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="content-detail-wrapper">
          <div className="content-image-gallery">
            <div className="content-main-image">
              {mainImage ? (
                <img src={mainImage} alt={aiProduct.product.name} />
              ) : (
                <p>No image available</p>
              )}
            </div>
            <button
              className="btn-generate-content"
              onClick={handleGenerateContent}
              disabled={contentLoading}
            >
              {contentLoading ? "Generating..." : "Generate Content ✨"}
            </button>
          </div>

          <div className="content-info">
            <h2>
              {aiProduct.product.name}
              <button
                className="copy-btn"
                onClick={() => handleCopy(aiProduct.product.name, "title")}
              >
                <FiCopy size={18} />
              </button>
              {copiedField === "title" && (
                <span className="copied-msg">Copied!</span>
              )}
            </h2>

            <p className="content-price">₹{aiProduct.product.price}</p>
            <p className="content-category">
              Category: {aiProduct.product.category}
            </p>

            <p className="content-description">
              {aiProduct.product.description}
              <button
                className="copy-btn"
                onClick={() =>
                  handleCopy(aiProduct.product.description, "desc")
                }
              >
                <FiCopy size={18} />
              </button>
              {copiedField === "desc" && (
                <span className="copied-msg">Copied!</span>
              )}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContentProductDetails;

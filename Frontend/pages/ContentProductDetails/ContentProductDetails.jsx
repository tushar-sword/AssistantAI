import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import { FiCopy } from "react-icons/fi";
import { fetchAiProductById } from "../../src/Redux/aiProductSlice";
import {
  fetchContentByProductId,
  generateContentForProduct,
} from "../../src/Redux/contentSlice";
import "./ContentProductDetails.css";

const ContentProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux states
  const { selectedAiProduct: aiProduct, isLoading, isError, message } =
    useSelector((state) => state.aiProducts);

  const {
    selectedContent,
    isLoading: contentLoading,
    isError: contentError,
    message: contentMessage,
  } = useSelector((state) => state.content);

  // Local states
  const [mainImage, setMainImage] = useState("");
  const [copiedField, setCopiedField] = useState("");

  // Fetch product + captions on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchAiProductById(id));
      dispatch(fetchContentByProductId(id));
    }
  }, [dispatch, id]);

  // Update main image when product changes
  useEffect(() => {
    if (aiProduct?.aiEnhancement?.enhancedImages?.length > 0) {
      setMainImage(aiProduct.aiEnhancement.enhancedImages[0].enhanced);
    } else if (aiProduct?.product?.images?.length > 0) {
      setMainImage(aiProduct.product.images[0].url);
    }
  }, [aiProduct]);

  // Copy helper
  const handleCopy = (text, field) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    });
  };

  // Generate captions
  const handleGenerateContent = async () => {
    if (!aiProduct?.product?._id) return;
    const resultAction = await dispatch(
      generateContentForProduct(aiProduct.product._id)
    );
    if (generateContentForProduct.fulfilled.match(resultAction)) {
      dispatch(fetchContentByProductId(aiProduct.product._id));
    }
  };

  if (isLoading) return <p className="content-loading">Loading product...</p>;
  if (isError) return <p className="content-error">{message}</p>;
  if (!aiProduct?.product)
    return <p className="content-no-product">Product not found</p>;

  // ---- Only show captions if they belong to this product ----
  const isSameProduct =
    selectedContent?.productId === aiProduct.product._id;

  const captions = isSameProduct
    ? selectedContent.captions || {
        instagram: [],
        facebook: [],
        whatsapp: [],
      }
    : { instagram: [], facebook: [], whatsapp: [] };

  return (
    <>
      <Navbar />
      <div className="content-detail-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="content-detail-wrapper">
          {/* ---------- Left side: Image + Generate ---------- */}
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
              {contentLoading ? "Generating..." : "Generate Captions ✨"}
            </button>
            {contentError && (
              <p className="content-error small">{contentMessage}</p>
            )}
          </div>

          {/* ---------- Right side: Product info + Captions ---------- */}
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

            {/* ---- Captions Section ---- */}
            <div className="captions-section">
              <h3>Generated Captions</h3>

              {captions.instagram.length === 0 &&
              captions.facebook.length === 0 &&
              captions.whatsapp.length === 0 ? (
                <p className="no-captions">No captions generated yet.</p>
              ) : (
                <>
                  {["instagram", "facebook", "whatsapp"].map((platform) =>
                    captions[platform]?.length > 0 ? (
                      <div key={platform} className="caption-block">
                        <h4 className="caption-title">
                          {platform.charAt(0).toUpperCase() +
                            platform.slice(1)}
                        </h4>
                        <ul>
                          {captions[platform].map((cap, idx) => (
                            <li key={idx}>
                              <span>{cap}</span>
                              <button
                                className="copy-btn"
                                onClick={() =>
                                  handleCopy(cap, `${platform}-${idx}`)
                                }
                              >
                                <FiCopy size={16} />
                              </button>
                              {copiedField === `${platform}-${idx}` && (
                                <span className="copied-msg">Copied!</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContentProductDetails;

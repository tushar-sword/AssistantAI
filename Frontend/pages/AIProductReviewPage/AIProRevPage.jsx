import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import AIProductCard from "../../src/components/AIProductCard/AIProductCard";
import { fetchAiProducts } from "../../src/Redux/aiProductSlice";
import "./AIProRevPage.css";

const AIProductReviewPage = () => {
  const dispatch = useDispatch();
  const { items: aiProducts, isLoading, isError, message } = useSelector(
    (state) => state.aiProducts
  );

  useEffect(() => {
    dispatch(fetchAiProducts());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div className="ai-review-container">
        <h2 className="ai-review-title">AI Enhanced Product Review</h2>

        {isLoading && <p className="loading">Loading AI enhanced products...</p>}
        {isError && <p className="error">{message}</p>}

        <div className="ai-product-grid">
          {aiProducts?.length > 0 ? (
            aiProducts.map((item) => (
              <AIProductCard
                key={item.product._id}
                product={item.product}
                aiEnhancement={item.aiEnhancement}
              />
            ))
          ) : (
            !isLoading && (
              <p className="no-products">No AI enhanced products found.</p>
            )
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AIProductReviewPage;

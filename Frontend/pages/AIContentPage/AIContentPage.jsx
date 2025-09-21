import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import ContentProductCard from "../../src/components/ContentProductCard/ContentProductCard";
import { fetchAiProducts } from "../../src/Redux/aiProductSlice";
import "./AIContentPage.css";

const AIContentPage = () => {
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
      <div className="ai-content-page">
        <h2 className="page-title">AI Content — All Products</h2>

        {isLoading && <p className="loading">Loading AI content products...</p>}
        {isError && <p className="error">{message}</p>}

        <div className="content-grid">
          {aiProducts?.length > 0 ? (
            aiProducts.map((item) => (
              <ContentProductCard
                key={item.product._id}
                product={item.product}
                aiEnhancement={item.aiEnhancement}
              />
            ))
          ) : (
            !isLoading && <p>No AI content products found.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AIContentPage;

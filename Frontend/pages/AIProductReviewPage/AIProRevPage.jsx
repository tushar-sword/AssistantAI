import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../src/Redux/productSlice";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import AIProductCard from "../../src/components/AIProductCard/AIProductCard";

import "./AIProRevPage.css";

const AIProductReviewPage = () => {
  const dispatch = useDispatch();
  const { items: products, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div className="ai-review-container">
        <h2 className="ai-review-title">AI Enhanced Product Review</h2>

        {isLoading && <p className="loading">Loading products...</p>}

        <div className="ai-product-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <AIProductCard key={product._id} product={product} />
            ))
          ) : (
            !isLoading && <p className="no-products">No products found.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AIProductReviewPage;

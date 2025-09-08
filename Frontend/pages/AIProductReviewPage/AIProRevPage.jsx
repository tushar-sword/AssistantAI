import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import AIProductCard from "../../src/components/AIProductCard/AIProductCard"; 
import { fetchProducts } from "../../src/Redux/productSlice";
import "./AIProRevPage.css";

const AIProductReviewPage = () => {
  const dispatch = useDispatch();
  const { items: products, isLoading, isError, message } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <div className="product-review-page">
        <h2 className="title">AI Enhanced Product Review</h2>

        {isLoading && <p className="loading">Loading products...</p>}
        {isError && <p className="error">{message}</p>}

        <div className="product-grid">
          {products?.length > 0 ? (
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

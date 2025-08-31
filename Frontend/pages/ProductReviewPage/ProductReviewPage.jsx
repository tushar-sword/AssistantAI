import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import ProductCard from "../../src/components/ProductCard/ProductCard"; 
import { fetchProducts } from "../../src/Redux/productSlice";
import "./ProductReviewPage.css";

const ProductReviewPage = () => {
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
        <h2 className="title">All Products</h2>

        {isLoading && <p className="loading">Loading products...</p>}
        {isError && <p className="error">{message}</p>}

        <div className="product-grid">
          {products?.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
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

export default ProductReviewPage;

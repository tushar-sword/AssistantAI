import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-image">
        <img src={product.images[0]?.url} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">₹{product.price}</p>
        <p className="category">{product.category}</p>
      </div>
    </Link>
  );
};

export default ProductCard;

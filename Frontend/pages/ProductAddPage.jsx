import React from "react";
import AddproductForm from "../src/components/AddProduct/AddproductForm";
import "./ProductAddPage.css";

const ProductAddPage = () => {
  return (
    <div className="product-add-page">
      <div className="page-header">
        <h1>Add New Product</h1>
        <p>Fill in the details below to add your product to the store</p>
      </div>

      <div className="form-wrapper">
        <AddproductForm />
      </div>
    </div>
  );
};

export default ProductAddPage;

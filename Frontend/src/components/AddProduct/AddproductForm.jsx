import React, { useState } from "react";
import "./AddproductForm.css";

const AddproductForm = () => {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // handle product submission
  };

  return (
    <div className="form-container">
      <form className="add-product-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Add New Product</h2>

        <div className="form-group">
          <label>Product Name</label>
          <input type="text" placeholder="Enter product name" required />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input type="number" placeholder="Enter price" required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input type="text" placeholder="e.g. Birthday, Decor, Gift" required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Write product description..." rows="4" />
        </div>

        <div className="form-group image-upload">
          <label>Upload Image</label>
          <div className="image-box">
            {imagePreview ? (
              <img src={imagePreview} alt="preview" />
            ) : (
              <span>Click to upload</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">Add Product</button>
      </form>
    </div>
  );
};

export default AddproductForm;

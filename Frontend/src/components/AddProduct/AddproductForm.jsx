import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, clearProductState } from "../../Redux/productSlice";
import "./AddproductForm.css";

const AddproductForm = () => {
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.products
  );

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  const [images, setImages] = useState([]); 
  const [imagePreview, setImagePreview] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4); // max 4
    setImages(files);

    // for preview
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("description", form.description);

    images.forEach((file) => {
      formData.append("images", file); // must match upload.array("images", 4)
    });

    dispatch(addProduct(formData));
  };

  //Auto-clear 
  useEffect(() => {
    if (isSuccess || isError) {
      const timer = setTimeout(() => {
        dispatch(clearProductState());
      }, 3000);

      if (isSuccess) {
        setForm({
          name: "",
          price: "",
          category: "",
          description: "",
        });
        setImages([]);
        setImagePreview([]);
      }

      return () => clearTimeout(timer);
    }
  }, [isSuccess, isError, dispatch]);

  return (
    <div className="form-container">
      <form className="add-product-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Add New Product</h2>

        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Birthday, Decor, Gift"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write product description..."
            rows="4"
          />
        </div>

        <div className="form-group image-upload">
          <label>Upload Images (Max 4)</label>
          <div className="image-box">
            {imagePreview.length > 0 ? (
              imagePreview.map((img, index) => (
                <img key={index} src={img} alt={`preview-${index}`} />
              ))
            ) : (
              <span>Click to upload</span>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Product"}
        </button>

        {isError && <p className="error">{message}</p>}
        {isSuccess && <p className="success">Product added successfully!</p>}
      </form>
    </div>
  );
};

export default AddproductForm;

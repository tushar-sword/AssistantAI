import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">AI Marketplace</div>
      <ul className="nav-links">
        <li><Link to="/add-product">Product Add</Link></li>
        <li><Link to="/product-review">Product Review</Link></li>
        <li><Link to="/ai-product-review">AI Product Review</Link></li>
        <li><Link to="/suggestion">Suggestion</Link></li>
        <li><Link to="/ai-content">AI Content</Link></li>
        <li><Link to="/ai-story">AI Story</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;

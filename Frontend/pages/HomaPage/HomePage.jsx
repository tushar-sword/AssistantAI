import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage">
      <Navbar />

      {/* Hero Section */}
      <div className="hero">
        <h1>Welcome Seller 🚀</h1>
        <p>Your AI-powered marketplace to add, review, and grow your products smarter.</p>
      </div>

      {/* Features Section */}
      <div className="features">
        <div className="feature-card">
          <Link to="/add-product" className="feature-card-link">
            <h3>Product Add</h3>
            <p>Add products easily with AI-optimized details.</p>
          </Link>
        </div>

        <div className="feature-card">
          <h3>Product Review</h3>
          <p>Collect reviews to boost your product quality.</p>
        </div>

        <div className="feature-card">
          <h3>AI Product Review</h3>
          <p>Smart AI analysis of customer feedback.</p>
        </div>

        <div className="feature-card">
          <h3>Suggestion</h3>
          <p>AI-driven tips to grow faster and smarter.</p>
        </div>

        <div className="feature-card">
          <h3>AI Content</h3>
          <p>Instantly create blogs & product posts.</p>
        </div>

        <div className="feature-card">
          <h3>AI Story</h3>
          <p>Build stories that connect with customers.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;

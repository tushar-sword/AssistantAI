import React from "react";
import { Link } from "react-router-dom";  // import Link
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">AI Marketplace</div>
        <ul className="nav-links">
          <li>
            <Link to="/add-product">Product Add</Link>
          </li>
          <li>
            <Link to="/product-review">Product Review</Link>
          </li>
          <li>
            <Link to="/ai-product-review">AI Product Review</Link>
          </li>
          <li>
            <Link to="/suggestion">Suggestion</Link>
          </li>
          <li>
            <Link to="/ai-content">AI Content</Link>
          </li>
          <li>
            <Link to="/ai-story">AI Story</Link>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h1>Welcome Seller 🚀</h1>
        <p>Your AI-powered marketplace to add, review, and grow your products smarter.</p>
      </div>

      {/* Features Section */}
      <div className="features">
        <div className="feature-card">
          <h3>Product Add</h3>
          <p>Add products easily with AI-optimized details.</p>
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

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Got You • Made for GEN AI Hackathon by Team ❤️</p>
      </footer>
    </div>
  );
};

export default HomePage;

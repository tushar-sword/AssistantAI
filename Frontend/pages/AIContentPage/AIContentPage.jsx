import React from "react";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";

import "./AIContentPage.css";

const AIContentPage = () => {
  return (
    <>
      <Navbar />
      <div className="ai-content-page">
        <div className="coming-soon-box">
          <h1 className="title">🚀 AI Content Studio</h1>
          <p className="subtitle">Coming Soon...</p>

          <div className="features-list">
            <h2>✨ Upcoming Features</h2>
            <ul>
              <li>🖼️ Auto-generate <b>Ad Posters</b> from seller’s product images</li>
              <li>🎥 Create <b>AI-powered Reels</b> for product marketing</li>
            </ul>
          </div>

          <div className="features-list">
            <h2>✅ Already Live</h2>
            <ul>
              <li>⚡ Smart <b>Product Highlights</b> using generative AI</li>
              <li>🌍 Smart Product based<b> Suggestions</b></li>
              <li>☁️ Image enhancement with <b>Generative AI</b></li>
            </ul>
          </div>

          <p className="note">
            We’re also launching <b>AI Story</b> soon 🎙️ – where product + audio = story.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AIContentPage;

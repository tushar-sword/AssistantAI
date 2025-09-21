import React from "react";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import "./AIStoryPage.css";

const AIStoryPage = () => {
  return (
    <>
      <Navbar />
      <div className="ai-story-container">
        <h2 className="story-page-title">AI Story Page</h2>
        <p className="coming-soon">Coming Soon...</p>
        <p className="story-description">
          This page is gonna help through generating blogs, sharing place to react, visit, funds opportunity, and exhibitions.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default AIStoryPage;

import React from "react";
import "./SuggestionBox.css";

const SuggestionBox = ({ suggestionsBox }) => {
  if (!suggestionsBox) {
    return <p className="no-suggestions">No AI suggestions yet. Generate first!</p>;
  }

  const renderSection = (title, data) => {
    if (!data || data.length === 0) return null;
    return (
      <div className="suggestion-section-box">
        <h4>{title}</h4>
        <ul>
          {data.map((item, i) => (
            <li key={i}>{typeof item === "object" ? JSON.stringify(item) : item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="suggestion-box-container">
      <h3>📦 AI Suggestion Box</h3>
      <div className="suggestion-grid">
        {renderSection("Platforms", suggestionsBox.platforms)}
        {renderSection("Target Audience", suggestionsBox.targetAudience)}
        {renderSection("Geo Markets", suggestionsBox.geoMarkets)}
        {renderSection("Seasonal Demand", suggestionsBox.seasonalDemand)}
        {renderSection("Festivals", suggestionsBox.festivals)}
        {renderSection("Gifting Occasions", suggestionsBox.giftingOccasions)}
        {renderSection("Marketing Channels", suggestionsBox.marketingChannels)}
        {renderSection("Content Ideas", suggestionsBox.contentIdeas)}
        {renderSection("Influencer Match", suggestionsBox.influencerMatch)}
        {renderSection("Hashtags", suggestionsBox.hashtags)}
        {renderSection("Collaboration Tips", suggestionsBox.collaborationTips)}
        {renderSection("Cross-sell / Upsell", suggestionsBox.crossSellUpsell)}
        {renderSection("Packaging Ideas", suggestionsBox.packagingIdeas)}
        {renderSection("Customer Retention", suggestionsBox.customerRetention)}
        {renderSection("Sustainability Tips", suggestionsBox.sustainabilityTips)}
        {renderSection("Cost Cutting Tips", suggestionsBox.costCuttingTips)}
        {renderSection("Competitor Insights", suggestionsBox.competitorInsights)}
        {renderSection("Current Trends", suggestionsBox.currentTrends)}
        {renderSection("Emotional Triggers", suggestionsBox.emotionalTriggers)}
        {renderSection("Color Psychology", suggestionsBox.colorPsychology)}
        {renderSection("Cause Marketing", suggestionsBox.causeMarketing)}
      </div>
    </div>
  );
};

export default SuggestionBox;

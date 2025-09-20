import React from "react";
import "./SuggestionBox.css";

const SuggestionBox = ({ suggestionsBox, suggestions }) => {
  const box = suggestionsBox ?? suggestions;

  if (!box || Object.keys(box).length === 0) {
    return (
      <p className="no-suggestions">
        🚀 No AI suggestions yet. Click "Generate Suggestions" to get started!
      </p>
    );
  }

  const renderSection = (title, data) => {
    if (!data || data.length === 0) return null;

    return (
      <div className="suggestion-card">
        <h4>{title}</h4>
        <ul>
          {data.map((item, i) => (
            <li key={i}>
              {typeof item === "object"
                ? Object.values(item).join(", ")
                : item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="suggestion-box-container">
      <h3>📦 AI Suggestion Box</h3>
      <div className="suggestion-grid">
        {renderSection("Platforms", box.platforms)}
        {renderSection("Target Audience", box.targetAudience)}
        {renderSection("Geo Markets", box.geoMarkets)}
        {renderSection("Seasonal Demand", box.seasonalDemand)}
        {renderSection("Festivals", box.festivals)}
        {renderSection("Gifting Occasions", box.giftingOccasions)}
        {renderSection("Marketing Channels", box.marketingChannels)}
        {renderSection("Content Ideas", box.contentIdeas)}
        {renderSection("Influencer Match", box.influencerMatch)}
        {renderSection("Hashtags", box.hashtags)}
        {renderSection("Collaboration Tips", box.collaborationTips)}
        {renderSection("Cross-sell / Upsell", box.crossSellUpsell)}
        {renderSection("Packaging Ideas", box.packagingIdeas)}
        {renderSection("Customer Retention", box.customerRetention)}
        {renderSection("Sustainability Tips", box.sustainabilityTips)}
        {renderSection("Cost Cutting Tips", box.costCuttingTips)}
        {renderSection("Competitor Insights", box.competitorInsights)}
        {renderSection("Current Trends", box.currentTrends)}
        {renderSection("Emotional Triggers", box.emotionalTriggers)}
        {renderSection("Color Psychology", box.colorPsychology)}
        {renderSection("Cause Marketing", box.causeMarketing)}
      </div>
    </div>
  );
};

export default SuggestionBox;

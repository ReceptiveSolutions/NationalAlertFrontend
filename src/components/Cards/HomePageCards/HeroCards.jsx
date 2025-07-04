import React, { useState } from 'react';
import { ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

function HeroCards({ article, index, onStoreArticle }) {
  const [expanded, setExpanded] = useState(false);

  const hasMoreThan50Words = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    return wordCount > 50;
  };

  const toggleExpand = () => {
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50) {
      if (onStoreArticle) {
        onStoreArticle(article);
      }
      // Navigate to the detail page - you can implement this based on your routing solution
      console.log(`Navigate to /article/${article.id}`);
    } else {
      setExpanded(prev => !prev);
    }
  };

  // Sample article data for demo
  const sampleArticle = article || {
    id: 1,
    title: "Sample News Article Title That Shows How Headlines Are Displayed",
    summary: "This is a sample summary for demonstration purposes. It contains enough text to show how the component handles longer content and how the read more functionality works with different text lengths.",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop",
    date: "Dec 15, 2024",
    isBreaking: false
  };

  const displayArticle = sampleArticle;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
        index < 2 ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
    >
      {/* Image Section */}
      <div className="relative">
        <img
          src={displayArticle.image}
          alt={displayArticle.title}
          className={`w-full object-cover ${
            index < 2 ? "h-48 sm:h-64" : "h-32 sm:h-40"
          }`}
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&sig=${index}`;
          }}
        />
        {displayArticle.isBreaking && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
            BREAKING
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Date */}
        <div className="text-xs text-gray-500 mb-2">
          {displayArticle.date}
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-black mb-3 leading-tight">
          {displayArticle.title}
        </h2>

        {/* Summary */}
        <div className="text-sm text-gray-700 mb-4">
          {expanded ? (
            <p>{displayArticle.summary}</p>
          ) : (
            <p className="line-clamp-3">{displayArticle.summary}</p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={toggleExpand}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            {hasMoreThan50Words(displayArticle.summary) ? (
              <>
                View full article
                <ExternalLink size={16} />
              </>
            ) : expanded ? (
              <>
                Read less
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                Read more
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroCards;
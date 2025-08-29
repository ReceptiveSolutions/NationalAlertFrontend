import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

function HeroCards({ article, index, onStoreArticle }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // ✅ FIXED: Don't render if no article is provided
  // Note: Use !== undefined to allow ID of 0, which is falsy but valid
  if (!article || article.id === undefined || article.id === null) {
    console.error('HeroCards: No article or article.id provided:', article);
    return null;
  }

  const hasMoreThan50Words = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    return wordCount > 50;
  };

  const toggleExpand = () => {
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    console.log('HeroCards: Navigating with article ID:', article.id); // Debug log
    
    if (wordCount > 50) {
      if (onStoreArticle) {
        onStoreArticle(article);
      }
      navigate(`/article/${article.id}`);
    } else {
      setExpanded(prev => !prev);
    }
  };

  // ✅ FIXED: Use the article directly, with safe fallbacks for individual properties
  const displayArticle = {
    id: article.id, // ✅ Always use the real ID
    title: article.title || "No title available",
    summary: article.summary || "No description available", 
    image: article.image || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&sig=${index}`,
    date: article.date || "No date",
    isBreaking: article.isBreaking || false
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
        index < 2 ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
      onClick={(e) => {
        // Allow navigation when clicking anywhere on the card for articles >50 words
        if (hasMoreThan50Words(displayArticle.summary)) {
          if (onStoreArticle) {
            onStoreArticle(displayArticle);
          }
          console.log('HeroCards: Card clicked, navigating with ID:', displayArticle.id); // Debug log
          navigate(`/article/${displayArticle.id}`);
        }
      }}
      style={{ cursor: hasMoreThan50Words(displayArticle.summary) ? 'pointer' : 'default' }}
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
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the card's onClick
              toggleExpand();
            }}
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
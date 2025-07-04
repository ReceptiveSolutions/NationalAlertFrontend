import React, { useState } from 'react';
import { FiExternalLink, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function SidebarCard({ article, index, onStoreArticle }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Check if summary has more than 50 words
  const hasMoreThan50Words = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    return wordCount > 50;
  };

  // Toggle expanded state for article
  const toggleExpand = () => {
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50) {
      // Store article data for detail page to access
      if (onStoreArticle) {
        onStoreArticle(article);
      }
      // Navigate to the detail page
      navigate(`/article/${article.id}`);
    } else {
      // For shorter articles, just toggle expansion in-place
      setExpanded(prev => !prev);
    }
  };

  return (
    <div className="flex items-start pb-3 sm:pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <span className="text-lg sm:text-2xl font-bold text-gray-300 mr-2 sm:mr-3 flex-shrink-0">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 cursor-pointer line-clamp-2">
          {article.title}
        </h3>
        <div className="text-xs sm:text-sm text-gray-600">
          {expanded ? (
            <p>{article.summary}</p>
          ) : (
            <p className="line-clamp-2">{article.summary.substring(0, 60)}...</p>
          )}
        </div>
        <button 
          onClick={toggleExpand}
          className="text-red-600 hover:text-red-500 text-xs font-medium flex items-center mt-2 cursor-pointer"
        >
          {hasMoreThan50Words(article.summary) ? (
            <>View full article <FiExternalLink className="ml-1" size={12} /></>
          ) : expanded ? (
            <>Read less <FiChevronUp className="ml-1" size={12} /></>
          ) : (
            <>Read more <FiChevronDown className="ml-1" size={12} /></>
          )}
        </button>
      </div>
    </div>
  );
}

export default SidebarCard;
import React, { useState } from 'react';
import { FiExternalLink, FiChevronUp, FiChevronDown, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function EheroCards({ content, index, onStoreArticle, categoryIcons = {} }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Check if summary has more than 50 words
  const hasMoreThan50Words = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    return wordCount > 50;
  };

  // Get button text based on content length and expansion state
  const getButtonText = (content, isExpanded) => {
    if (hasMoreThan50Words(content.summary)) {
      return "View full article ";
    }
    return isExpanded ? "Read less " : "Read more ";
  };

  // Handle read more functionality
  const handleReadMore = () => {
    const wordCount = content.summary ? content.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50) {
      // Store article data for detail page to access
      if (onStoreArticle) {
        onStoreArticle(content);
      }
      // Navigate to the detail page
      navigate(`/article/${content.id}`);
    } else {
      // For shorter articles, just toggle expansion in-place
      setExpanded(prev => !prev);
    }
  };

  return (
    <div 
      className={`bg-black bg-opacity-40 shadow-md overflow-hidden rounded-xl backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
        index < 2 ? 'lg:col-span-2' : ''
      }`}
    >
      <div className="relative">
        <img 
          src={content.image} 
          alt={content.title} 
          className={`w-full ${index < 2 ? 'h-72' : 'h-40'} object-cover`}
          onError={(e) => {
            e.target.src = `https://source.unsplash.com/random/800x500/?${content.subcategory?.toLowerCase()},entertainment`;
          }}
        />
        {content.isHot && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
            HOT 🔥
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20"></div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-pink-300 flex items-center">
            {categoryIcons[content.subcategory] || <FiStar className="mr-1" />}
            {content.subcategory}
          </span>
          <span className="text-xs text-gray-300">{content.date}</span>
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-white">
          {content.title}
        </h2>
        <div className="text-sm text-gray-300 mb-3">
          {expanded ? (
            <p>{content.summary.length > 150 ? content.summary.substring(0, 150) + "..." : content.summary}</p>
          ) : (
            <p className="line-clamp-2">{content.summary}</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={handleReadMore}
            className="text-pink-400 hover:text-pink-300 text-xs font-medium flex items-center cursor-pointer"
          >
            {getButtonText(content, expanded)}
            {hasMoreThan50Words(content.summary) ? (
              <FiExternalLink className="ml-1" size={14} />
            ) : expanded ? (
              <FiChevronUp className="ml-1" size={14} />
            ) : (
              <FiChevronDown className="ml-1" size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EheroCards;
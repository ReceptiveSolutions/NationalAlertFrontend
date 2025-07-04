import React, { useState } from 'react';
import { FiArrowRight, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function BotherCards(props) {
  // Completely safe props handling
  const safeProps = props || {};
  
  // Safely destructure props with defaults
  const {
    id = Math.random(),
    title = "No Title",
    description = "No description available",
    image = null,
    date = "No Date",
    onReadMore = null,
    onStoreArticle = null, // Add this prop for storing article data
    isExpanded = false,
    maxWords = 50,
    fallbackImageCategory = "finance"
  } = safeProps;

  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(isExpanded);
  const navigate = useNavigate(); // Add navigation hook
  // Function to check if description has more than maxWords
  const hasMoreThanMaxWords = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    return wordCount > maxWords;
  };

  // Function to count words in description
  const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Get image source with fallback
  const getImageSource = () => {
    if (!image || image === null || image === undefined || image === '' || typeof image !== 'string') {
      return `https://source.unsplash.com/random/300x200/?${fallbackImageCategory || 'news'},finance`;
    }
    return image;
  };

  // Handle image error
  const handleImageError = (e) => {
    if (!imageError && e && e.target) {
      setImageError(true);
      e.target.src = `https://source.unsplash.com/random/300x200/?${fallbackImageCategory || 'news'},finance`;
    }
  };

  // Get button text based on word count and expansion state
  const getButtonText = () => {
    if (hasMoreThanMaxWords(description)) {
      return "Read Full Article";
    }
    return expanded ? "Show Less" : "Read More";
  };

  // Get appropriate icon
  const getIcon = () => {
    if (hasMoreThanMaxWords(description)) {
      return <FiArrowRight className="ml-1" size={14} />;
    }
    return expanded ? <FiChevronUp className="ml-1" size={14} /> : <FiChevronDown className="ml-1" size={14} />;
  };

  // Handle read more click - Updated to match ElatestCards functionality
  const handleReadMoreClick = () => {
    const wordCount = countWords(description);
    
    if (wordCount > maxWords) {
      // For full article navigation
      if (onStoreArticle) {
        onStoreArticle(safeProps); // Store the entire article data
      }
      // Navigate to the article page
      navigate(`/article/${id}`);
    } else {
      // For expand/collapse functionality
      setExpanded(prev => !prev);
      
      // Also call the original onReadMore if provided
      if (onReadMore && typeof onReadMore === 'function') {
        onReadMore(id);
      }
    }
  };

  return (
    <div className="bg-white bg-opacity-60 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 backdrop-blur-sm group border-l-4 border-red-600">
      <div className="md:flex">
        {/* Image Section */}
        <div className="md:flex-shrink-0 md:w-48 w-full h-48 md:h-auto overflow-hidden relative">
          <img 
            className="w-full h-full object-cover" 
            src={getImageSource()} 
            alt={`News image: ${title || 'News'}`}
            onError={handleImageError}
          />
        </div>
        
        {/* Content Section */}
        <div className="p-4 md:p-6 flex-1">
          {/* Date */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-black">{date || 'No Date'}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-black mb-2 transition-colors">
            {title || 'No Title'}
          </h3>
          
          {/* Description */}
          <div 
            className={`text-black mb-4 overflow-hidden transition-all duration-300 ${
              expanded ? 'max-h-48' : 'max-h-12'
            }`}
          >
            <p className={expanded ? '' : 'line-clamp-3'}>
              {description || 'No description available'}
            </p>
          </div>
          
          {/* Read More Button */}
          <div className="flex justify-between items-center">
            <button 
              onClick={handleReadMoreClick}
              className="text-red-600 text-sm font-medium flex items-center transition-colors cursor-pointer hover:text-red-700"
            >
              {getButtonText()}
              {getIcon()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BotherCards;
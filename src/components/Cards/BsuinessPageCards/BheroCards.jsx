import React, { useState } from 'react';
import { 
  FiBarChart2, 
  FiArrowRight, 
  FiChevronUp, 
  FiChevronDown
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const BheroCards = ({ 
  stock = {}, 
  index = 0, 
  categoryIcons = {},
  onStoreArticle = null, // Add this prop for storing article data
  maxWords = 50
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Safe props handling with defaults
  const safeStock = {
    id: stock.id || Math.random(),
    title: stock.title || "No Title",
    summary: stock.summary || "No description available",
    image: stock.image || null,
    date: stock.date || "No Date",
    subcategory: stock.subcategory || "Stocks",
    stockPrice: stock.stockPrice || "$0.00",
    stockChange: stock.stockChange || "+0.00%",
    isHot: stock.isHot || false,
    ...stock
  };

  // Function to count words in description
  const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Function to check if description has more than maxWords
  const hasMoreThanMaxWords = (text) => {
    const wordCount = countWords(text);
    return wordCount > maxWords;
  };

  // Get button text based on word count and expansion state
  const getButtonText = () => {
    if (hasMoreThanMaxWords(safeStock.summary)) {
      return "Read Full Article";
    }
    return expanded ? "Show Less" : "Read More";
  };

  // Get appropriate icon
  const getIcon = () => {
    if (hasMoreThanMaxWords(safeStock.summary)) {
      return <FiArrowRight className="ml-1" size={14} />;
    }
    return expanded ? <FiChevronUp className="ml-1" size={14} /> : <FiChevronDown className="ml-1" size={14} />;
  };

  // Handle image error
  const handleImageError = (e) => {
    if (!imageError && e && e.target) {
      setImageError(true);
      e.target.src = `https://source.unsplash.com/random/800x500/?${safeStock.subcategory.toLowerCase()},finance`;
    }
  };

  // Get image source with fallback
  const getImageSource = () => {
    if (!safeStock.image || safeStock.image === null || safeStock.image === undefined || safeStock.image === '' || typeof safeStock.image !== 'string') {
      return `https://source.unsplash.com/random/800x500/?${safeStock.subcategory.toLowerCase()},finance`;
    }
    return safeStock.image;
  };

  // Handle read more click
  const handleReadMoreClick = () => {
    const wordCount = countWords(safeStock.summary);
    
    if (wordCount > maxWords) {
      // For full article navigation
      if (onStoreArticle) {
        onStoreArticle(safeStock); // Store the entire article data
      }
      // Navigate to the article page
      navigate(`/article/${safeStock.id}`);
    } else {
      // For expand/collapse functionality
      setExpanded(prev => !prev);
    }
  };

  return (
    <div 
      className={`bg-white bg-opacity-40 shadow-md overflow-hidden rounded-xl backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${index < 2 ? 'lg:col-span-2' : ''}`}
    >
      <div className="relative">
        <img 
          src={getImageSource()} 
          alt={safeStock.title} 
          className={`w-full ${index < 2 ? 'h-72' : 'h-40'} object-cover`}
          onError={handleImageError}
        />
        {safeStock.isHot && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
            BULLISH 📈
          </div>
        )}
        {!safeStock.isHot && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
            BEARISH 📉
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-neon h-20"></div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-black flex items-center">
            {categoryIcons[safeStock.subcategory] || <FiBarChart2 className="mr-1" />}
            {safeStock.subcategory}
          </span>
          <span className="text-xs text-black">{safeStock.date}</span>
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-black">
          {safeStock.title}
        </h2>
        
        <div className="text-sm text-black mb-3">
          {expanded ? (
            <p>{safeStock.summary}</p>
          ) : (
            <p className="line-clamp-2">{safeStock.summary}</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold text-red">{safeStock.stockPrice}</span>
            <span className={`text-sm font-semibold ${safeStock.stockChange.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
              {safeStock.stockChange}
            </span>
          </div>
          <button 
            onClick={handleReadMoreClick}
            className="text-red-600 text-xs font-medium flex items-center cursor-pointer hover:text-red-700 transition-colors"
          >
            {getButtonText()}
            {getIcon()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BheroCards;
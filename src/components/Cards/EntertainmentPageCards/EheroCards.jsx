import React, { useState } from 'react';
import { 
  FiExternalLink, 
  FiChevronUp, 
  FiChevronDown, 
  FiStar,
  FiBarChart2
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function EheroCards({ 
  content = {}, 
  index = 0, 
  onStoreArticle = null,
  categoryIcons = {},
  maxWords = 50
}) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Safe props handling with defaults
  const safeContent = {
    ...content, // Spread original content FIRST to preserve all original properties
    title: content.title || "No Title",
    summary: content.summary || content.description || "No description available",
    image: content.image || content.image_url || null,
    date: content.date || content.created_at || "No Date",
    subcategory: content.subcategory || (Array.isArray(content.category) ? content.category[0] : content.category) || "Entertainment",
    isHot: content.isHot || false
  };

  // Add validation to ensure we have a valid ID
  if (!safeContent.id) {
    console.error('Article missing ID:', content);
    return null; // Don't render if no valid ID
  }

  // Check if the ID is in the wrong format (main-X) which indicates data processing issue
  if (safeContent.id && safeContent.id.startsWith('main-')) {
    console.error('❌ FOUND THE PROBLEM! Article ID has been overwritten with main-{index} format:', safeContent.id);
    console.error('This means in your entertainment page, you are probably still doing: {id: `main-${index}`}');
    return null;
  }

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
    if (hasMoreThanMaxWords(safeContent.summary)) {
      return "Read Full Article";
    }
    return expanded ? "Show Less" : "Read More";
  };

  // Get appropriate icon
  const getIcon = () => {
    if (hasMoreThanMaxWords(safeContent.summary)) {
      return <FiExternalLink className="ml-1" size={14} />;
    }
    return expanded ? <FiChevronUp className="ml-1" size={14} /> : <FiChevronDown className="ml-1" size={14} />;
  };

  // Handle image error
  const handleImageError = (e) => {
    if (!imageError && e && e.target) {
      setImageError(true);
      e.target.src = `https://source.unsplash.com/random/800x500/?${safeContent.subcategory.toLowerCase()},entertainment`;
    }
  };

  // Get image source with fallback
  const getImageSource = () => {
    if (!safeContent.image || typeof safeContent.image !== 'string') {
      return `https://source.unsplash.com/random/800x500/?${safeContent.subcategory.toLowerCase()},entertainment`;
    }
    return safeContent.image;
  };

  // Handle read more click
  const handleReadMoreClick = () => {
    const wordCount = countWords(safeContent.summary);
    
    console.log('Clicking read more for article:', safeContent.id); // Debug log
    
    if (wordCount > maxWords) {
      // For full article navigation
      if (onStoreArticle) {
        onStoreArticle(safeContent);
      }
      // Navigate to the article page with the correct ID
      navigate(`/article/${safeContent.id}`, {
        state: { article: safeContent } // Pass the article data via state
      });
    } else {
      // For expand/collapse functionality
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
          src={getImageSource()} 
          alt={safeContent.title} 
          className={`w-full ${index < 2 ? 'h-72' : 'h-40'} object-cover`}
          onError={handleImageError}
        />
        {safeContent.isHot && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
            HOT 🔥
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20"></div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-pink-300 flex items-center">
            {categoryIcons[safeContent.subcategory] || <FiStar className="mr-1" />}
            {safeContent.subcategory}
          </span>
          <span className="text-xs text-gray-300">{safeContent.date}</span>
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-white">
          {safeContent.title}
        </h2>
        
        <div className="text-sm text-gray-300 mb-3">
          {expanded ? (
            <p>{safeContent.summary}</p>
          ) : (
            <p className="line-clamp-2">{safeContent.summary}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={handleReadMoreClick}
            className="text-pink-400 text-xs font-medium flex items-center cursor-pointer hover:text-pink-300 transition-colors"
          >
            {getButtonText()}
            {getIcon()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EheroCards;
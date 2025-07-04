import React, { useState } from 'react';
import { FiExternalLink, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function CardSM({ article, onStoreArticle }) {
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-shrink-0 w-full sm:w-32 md:w-48 h-48 sm:h-32 md:h-auto overflow-hidden relative">
          <img 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
            src={article.image} 
            alt={`News image: ${article.title}`}
            onError={(e) => {
              e.target.src = `https://source.unsplash.com/random/300x200/?news,${article.id}`;
              e.target.alt = "News placeholder image";
            }}
          />
          {/* Source badge - uncomment if needed */}
          {/* <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
            API
          </div> */}
        </div>
        <div className="p-4 sm:p-4 md:p-6 flex-1 min-w-0">
          <div className="mb-2">
            <span className="text-xs text-gray-500">{article.date}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 cursor-pointer transition-colors duration-200 line-clamp-2">
            {article.title}
          </h3>
          
          <div 
            className="text-sm sm:text-base text-gray-600 mb-4 overflow-hidden transition-all duration-300" 
            style={{maxHeight: expanded ? '1000px' : '3rem'}}
          >
            <p className={expanded ? '' : 'line-clamp-2'}>
              {article.summary}
            </p>
          </div>
          
          <button 
            onClick={toggleExpand}
            className="text-red-600 hover:text-red-500 text-sm font-medium flex items-center transition-colors duration-200 cursor-pointer"
            aria-expanded={expanded ? "true" : "false"}
          >
            {hasMoreThan50Words(article.summary) ? (
              <>View full article <FiExternalLink className="ml-1" size={14} /></>
            ) : expanded ? (
              <>Read less <FiChevronUp className="ml-1" size={14} /></>
            ) : (
              <>Read more <FiChevronDown className="ml-1" size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardSM;
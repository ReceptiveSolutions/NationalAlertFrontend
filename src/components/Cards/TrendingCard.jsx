import React from 'react';
import { 
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const TrendingCard = ({ 
  content, 
  isExpanded, 
  onReadMore 
}) => {
  const hasMoreThan50Words = (text) => {
    if (!text) return false;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    return wordCount > 50;
  };

  const getButtonText = (content, isExpanded) => {
    const moreThan50Words = hasMoreThan50Words(content.summary);
    
    if (moreThan50Words) {
      return isExpanded ? 'Show less' : 'View full article';
    } else {
      return isExpanded ? 'Show less' : 'Read more';
    }
  };

  return (
    <div className="flex items-start pb-4 border-b border-gray-800 last:border-0 last:pb-0 group">
      <span className="text-2xl font-bold text-pink-500 mr-3 group-hover:scale-110 transition-transform">
        {content.trendIcon}
      </span>
      <div>
        <h3 className="text-base font-semibold text-white mb-1 cursor-pointer hover:text-pink-400 transition-colors">
          {content.title}
        </h3>
        <div className="text-sm text-gray-400">
          {isExpanded ? (
            <p>{content.summary}</p>
          ) : (
            <p>{content.summary.substring(0, 60)}...</p>
          )}
        </div>
        <button 
          onClick={() => onReadMore(content)}
          className="text-pink-500 hover:text-pink-400 text-xs font-medium flex items-center mt-2 cursor-pointer"
        >
          {getButtonText(content, isExpanded)}
          {isExpanded ? (
            <FiChevronUp className="ml-1" size={14} />
          ) : (
            <FiChevronDown className="ml-1" size={14} />
          )}
        </button>
      </div>
    </div>
  );
};

export default TrendingCard;
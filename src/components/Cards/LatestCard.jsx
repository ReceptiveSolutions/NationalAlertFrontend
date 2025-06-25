import React from 'react';
import { 
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const LatestCard = ({ 
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
    <div className="bg-black bg-opacity-40 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-gray-800 group">
      <div className="md:flex">
        <div className="md:flex-shrink-0 md:w-48 w-full h-48 md:h-auto overflow-hidden relative">
          <img 
            className="w-full h-full object-cover" 
            src={content.image} 
            alt={`Entertainment image: ${content.title}`}
            onError={(e) => {
              e.target.src = `https://source.unsplash.com/random/300x200/?${content.subcategory.toLowerCase()},entertainment`;
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16"></div>
          
          {/* Optional indicators */}
          {content.isHot && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              HOT 🔥
            </div>
          )}
          
          {/* {content.source === 'RSS' && (
            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              RSS
            </div>
          )} */}8 
        </div>
        
        <div className="p-4 md:p-6 flex-1">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-pink-400">{content.date}</span>
            <span className="text-xs text-gray-400">{content.readTime}</span>
          </div>
          
          <h3 className="text-xl font-semibold text-pink-400 mb-2 transition-colors">
            {content.title}
          </h3>
          
          <div 
            className="text-gray-300 mb-4 overflow-hidden transition-all duration-300" 
            style={{maxHeight: isExpanded ? '1000px' : '3rem'}}
          >
            <p>
              {content.summary.length > 150 && !isExpanded 
                ? content.summary.substring(0, 150) + "..." 
                : content.summary.substring(0, 150) + "..."
              }
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              onClick={() => onReadMore(content)}
              className="text-pink-500 hover:text-pink-400 text-sm font-medium flex items-center transition-colors cursor-pointer"
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
      </div>
    </div>
  );
};

export default LatestCard;
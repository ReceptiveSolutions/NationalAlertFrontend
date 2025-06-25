import React from 'react';
import { 
  FiStar, 
  FiFilm, 
  FiTv, 
  FiMusic, 
  FiAward,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const FeaturedCard = ({ 
  content, 
  index, 
  isExpanded, 
  onReadMore, 
  onToggleExpand 
}) => {
  const categoryIcons = {
    'Movies': <FiFilm className="mr-2" />,
    'TV Shows': <FiTv className="mr-2" />,
    'Music': <FiMusic className="mr-2" />,
    'Awards': <FiAward className="mr-2" />,
    'General': <FiStar className="mr-2" />
  };

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
    <div 
      className={`bg-black bg-opacity-40 shadow-md overflow-hidden rounded-xl backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${index < 2 ? 'lg:col-span-2' : ''}`}
    >
      <div className="relative">
        <img 
          src={content.image} 
          alt={content.title} 
          className={`w-full ${index < 2 ? 'h-72' : 'h-40'} object-cover`}
          onError={(e) => {
            e.target.src = `https://source.unsplash.com/random/800x500/?${content.subcategory.toLowerCase()},entertainment`;
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
          {isExpanded ? (
            <p>{content.summary.length > 150 ? content.summary.substring(0, 150) + "..." : content.summary}</p>
          ) : (
            <p className="line-clamp-2">{content.summary}</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => onReadMore(content)}
            className="text-pink-400 hover:text-pink-300 text-xs font-medium flex items-center cursor-pointer"
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
  );
};

export default FeaturedCard;
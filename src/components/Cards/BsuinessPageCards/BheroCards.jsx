import React from 'react';
import { 
  FiBarChart2, 
  FiArrowRight, 
  FiChevronUp, 
  FiChevronDown
} from 'react-icons/fi';

const BheroCards = ({ 
  stock, 
  index = 0, 
  expandedArticles = {}, 
  handleReadMoreClick,
  getButtonText,
  countWords,
  categoryIcons = {}
}) => {
  return (
    <div 
      key={stock.id} 
      className={`bg-white bg-opacity-40 shadow-md overflow-hidden rounded-xl backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${index < 2 ? 'lg:col-span-2' : ''}`}
    >
      <div className="relative">
        <img 
          src={stock.image} 
          alt={stock.title} 
          className={`w-full ${index < 2 ? 'h-72' : 'h-40'} object-cover`}
          onError={(e) => {
            e.target.src = `https://source.unsplash.com/random/800x500/?${stock.subcategory.toLowerCase()},finance`;
          }}
        />
        {stock.isHot && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
            BULLISH 📈
          </div>
        )}
        {!stock.isHot && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
            BEARISH 📉
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-neon h-20"></div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-black flex items-center">
            {categoryIcons[stock.subcategory] || <FiBarChart2 className="mr-1" />}
            {stock.subcategory}
          </span>
          <span className="text-xs text-black">{stock.date}</span>
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-black">
          {stock.title}
        </h2>
        <div className="text-sm text-black mb-3">
          {expandedArticles[`hero_${stock.id}`] ? (
            <p>{stock.summary}</p>
          ) : (
            <p className="line-clamp-2">{stock.summary}</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold text-red">{stock.stockPrice}</span>
            <span className={`text-sm font-semibold ${stock.stockChange.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
              {stock.stockChange}
            </span>
          </div>
          <button 
            onClick={() => handleReadMoreClick(stock, 'hero')}
            className="text-red-600 text-xs font-medium flex items-center cursor-pointer"
          >
            {getButtonText(stock, 'hero', `hero_${stock.id}`)}
            {countWords(stock.summary) > 50 ? (
              <FiArrowRight className="ml-1" size={14} />
            ) : expandedArticles[`hero_${stock.id}`] ? (
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

export default BheroCards;
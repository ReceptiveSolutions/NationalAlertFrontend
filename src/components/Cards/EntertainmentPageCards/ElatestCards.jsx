import React, { useState } from 'react';
import { ExternalLink, ChevronUp, ChevronDown, Calendar, Clock, Share2, Eye, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Add this import

function ElatestCards({ content, onStoreArticle }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate(); // Add this hook

  const hasMoreThan50Words = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    return wordCount > 50;
  };

  const getButtonText = (content, isExpanded) => {
    if (hasMoreThan50Words(content.summary)) {
      return "Read Full Article";
    }
    return isExpanded ? "Show Less" : "Read More";
  };

  const handleReadMore = () => {
    const wordCount = content.summary ? content.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50) {
      // For full article navigation
      if (onStoreArticle) {
        onStoreArticle(content);
      }
      // Actually navigate to the article page
      navigate(`/article/${content.id}`);
    } else {
      // For expand/collapse functionality
      setExpanded(prev => !prev);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReadingTime = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200);
    return readingTime;
  };

  return (
    <article className="group relative bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-700 w-full">
      
      {/* News Card Layout - Horizontal on larger screens */}
      <div className="flex flex-col md:flex-row">
        
        {/* Image Container - News Style */}
        <div className="relative overflow-hidden md:w-80 md:flex-shrink-0">
          <div className="aspect-[16/10] md:aspect-[4/3] w-full h-full">
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={content.image}
              alt={`Entertainment image: ${content.title}`}
              onError={(e) => {
                e.target.src = `https://source.unsplash.com/random/600x400/?${content.subcategory?.toLowerCase()},entertainment`;
              }}
            />
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {content.subcategory}
            </span>
          </div>

          {/* Share Button */}
          {/* <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
              <Share2 size={16} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div> */}
        </div>

        {/* Content Container - News Style */}
        <div className="flex-1 p-6 flex flex-col">
          
          {/* Meta Information */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-pink-500" />
                <time dateTime={content.date}>{formatDate(content.date)}</time>
              </div>
              {/* <div className="flex items-center gap-1">
                <Clock size={14} className="text-purple-500" />
                <span>{getReadingTime(content.summary)} min read</span>
              </div> */}
            </div>
            
            {/* News Engagement Stats */}
            {/* <div className="hidden sm:flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>1.2k</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                <span>24</span>
              </div>
            </div> */}
          </div>

          {/* Title - News Headlines Style */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300 cursor-pointer">
            {content.title}
          </h2>

          {/* Summary - News Article Style */}
          <div className="relative flex-1">
            <div
              className={`text-gray-600 dark:text-gray-300 text-base leading-relaxed transition-all duration-300 overflow-hidden ${
                expanded ? 'max-h-48' : 'max-h-20'
              }`}
            >
              <p className={expanded ? '' : 'line-clamp-3'}>
                {content.summary}
              </p>
            </div>
            
            {!expanded && content.summary && content.summary.length > 150 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
            )}
          </div>

          {/* Action Bar - News Style */}
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleReadMore}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              {getButtonText(content, expanded)}
              {hasMoreThan50Words(content.summary) ? (
                <ExternalLink size={16} className="transition-transform group-hover:translate-x-0.5" />
              ) : expanded ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {/* News Source/Author Info */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Entertainment News</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-lg border border-transparent bg-gradient-to-r from-pink-500/10 via-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </article>
  );
}

export default ElatestCards;
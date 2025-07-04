import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Hash, 
  BookOpen, 
  ArrowRight, 
  ImageIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LpageCards({ 
  article, 
  index = 0, 
  onStoreArticle = null,
  showBreakingBadge = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Safe article handling
  const safeArticle = article || {};
  const {
    $id: id = Math.random(),
    title = "No Title Available",
    content = "No content available",
    category = null,
    tags = [],
    author = null,
    $createdAt: createdAt = new Date().toISOString(),
    image = null,
    imageUrl = null
  } = safeArticle;

  // Count words in content
  const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = countWords(content);
  const shouldTruncate = wordCount > 50;

  // Truncate content for preview
  const truncateContent = (text) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > 30 ? words.slice(0, 30).join(' ') + '...' : text;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle read more click
  const handleReadMore = (articleData) => {
    const wordCount = countWords(articleData.content);
    
    if (wordCount > 50) {
      // For full article navigation
      if (onStoreArticle) {
        onStoreArticle(articleData);
      }
      // Navigate to the article page
      navigate(`/article/${articleData.$id || articleData.id}`);
    } else {
      // For expand/collapse functionality
      setIsExpanded(prev => !prev);
    }
  };

  // Get image URL (handles both image and imageUrl props)
  const getImageUrl = () => {
    return imageUrl || image;
  };

  // Handle image error
  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = 'none';
    e.target.parentElement.querySelector('.fallback-placeholder').style.display = 'flex';
  };

  // Handle image load success
  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', getImageUrl());
  };

  return (
    <article className="group bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden shadow-2xl relative rounded-lg">
      {/* Featured Image */}
      <div className="relative h-56 bg-gray-800 overflow-hidden">
        {getImageUrl() && !imageError ? (
          <img
            src={getImageUrl()}
            alt={title || 'Article image'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div 
          className={`fallback-placeholder absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${getImageUrl() && !imageError ? 'hidden' : 'flex'}`}
        >
          <div className="text-center">
            <ImageIcon className="text-gray-500 mb-2 mx-auto" size={48} />
            <p className="text-gray-400 text-sm">No Image Available</p>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 right-4">
            <span className="bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {category}
            </span>
          </div>
        )}

        {/* Breaking Badge for first article or when specified */}
        {(index === 0 || showBreakingBadge) && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
              🔴 Breaking
            </span>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 
          className="text-xl font-bold text-white mb-4 line-clamp-2 hover:text-red-400 transition-colors cursor-pointer group-hover:text-red-300"
          onClick={() => handleReadMore(safeArticle)}
        >
          {title}
        </h3>
        
        {/* Meta Information */}
        <div className="flex items-center justify-between text-gray-400 text-sm mb-4 pb-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
          {author && (
            <div className="flex items-center gap-1 text-red-400">
              <User size={14} />
              <span>{author}</span>
            </div>
          )}
        </div>
        
        {/* Content Preview */}
        <div className="text-gray-300 mb-6 leading-relaxed">
          {shouldTruncate && !isExpanded && wordCount <= 50 ? (
            <p className="text-sm">{truncateContent(content)}</p>
          ) : wordCount <= 50 && isExpanded ? (
            <div 
              className="text-sm prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          ) : (
            <p className="text-sm">{truncateContent(content)}</p>
          )}
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.slice(0, 3).map((tag, tagIndex) => (
              <span key={tagIndex} className="flex items-center gap-1 bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs hover:bg-gray-700 transition-colors">
                <Hash size={10} />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full text-xs">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          {/* Read More Button */}
          <button
            onClick={() => handleReadMore(safeArticle)}
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold text-sm transition-all duration-300 group/btn cursor-pointer"
          >
            <BookOpen size={16} />
            <span>
              {wordCount > 50 ? 'Read Full Article' : isExpanded ? 'Show Less' : 'Read More'}
            </span>
            <ArrowRight 
              size={16} 
              className="transform group-hover/btn:translate-x-1 transition-transform" 
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default LpageCards;
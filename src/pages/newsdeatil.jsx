import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiShare2, FiExternalLink, FiInfo } from 'react-icons/fi';
import DOMPurify from 'dompurify';
import { storage } from '../appwrite/appwriteConfig';
import conf from '../conf/conf';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if content is actually available or just a placeholder
  const isContentAvailable = (content) => {
    if (!content) return false;
    
    const unavailableMessages = [
      'ONLY AVAILABLE IN PAID PLANS',
      'ONLY AVAILABLE IN PROFESSIONAL AND CORPORATE PLANS',
      'Content not available',
      'Full article not available'
    ];
    
    if (typeof content === 'string') {
      return !unavailableMessages.some(msg => content.includes(msg));
    }
    
    return true;
  };

  // Enhanced content renderer that handles unavailable content
  const renderContent = (content, description) => {
    try {
      if (!content || !isContentAvailable(content)) {
        // If content is not available, show description with a notice
        return (
          <div className="space-y-6">
            {/* Content Unavailable Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-start">
                <FiInfo className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-800 mb-2">
                    Full Article Content Not Available
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    The complete article content is not available through our current data source. 
                    You can read the full article by visiting the original source.
                  </p>
                  {article.link && (
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                    >
                      Read Full Article
                      <FiExternalLink className="ml-1 w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Show description as preview */}
            {description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Article Summary</h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed sm:leading-loose">
                  {description}
                </p>
              </div>
            )}

            {/* Call to action */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center">
              <p className="text-gray-600 mb-4">
                Want to read the complete article?
              </p>
              {article.link ? (
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Visit Original Source
                  <FiExternalLink className="ml-2 w-4 h-4" />
                </a>
              ) : (
                <p className="text-sm text-gray-500">Original source link not available</p>
              )}
            </div>
          </div>
        );
      }

      // If content is available, render it normally
      if (typeof content === 'string' && content.startsWith('<')) {
        return (
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
          />
        );
      }

      if (typeof content === 'string') {
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
        return paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-4 text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed sm:leading-loose">
            {paragraph}
          </p>
        ));
      }

      if (Array.isArray(content)) {
        return content.map((item, index) => {
          if (typeof item === 'string') {
            return (
              <p key={index} className="mb-4 text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed sm:leading-loose">
                {item}
              </p>
            );
          }
          if (item.subheading && item.text) {
            return (
              <div key={index} className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800">
                  {item.subheading}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed sm:leading-loose">
                  {item.text}
                </p>
              </div>
            );
          }
          return (
            <p key={index} className="mb-4 text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed sm:leading-loose">
              {JSON.stringify(item)}
            </p>
          );
        });
      }

      if (typeof content === 'object') {
        return (
          <pre className="whitespace-pre-wrap text-xs sm:text-sm bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto max-w-full">
            {JSON.stringify(content, null, 2)}
          </pre>
        );
      }

      return (
        <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed sm:leading-loose">
          {String(content)}
        </p>
      );
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="text-red-500 p-3 sm:p-4 bg-red-50 rounded-lg text-sm sm:text-base">
          Error displaying content
        </div>
      );
    }
  };

  const getImageUrl = (imageId) => {
    try {
      if (!imageId) {
        return 'https://via.placeholder.com/1200x600/cccccc/666666?text=No+Image';
      }
      
      if (typeof imageId === 'string' && imageId.startsWith('http')) {
        return imageId;
      }
      
      if (typeof imageId === 'object' && imageId !== null) {
        return imageId.url || imageId.src || imageId.href || null;
      }
      
      if (imageId && conf.appwriteBucketId) {
        try {
          const viewUrl = storage.getFileView(conf.appwriteBucketId, imageId);
          if (typeof viewUrl === 'string') return viewUrl;
          if (viewUrl?.href) return viewUrl.href;
          return viewUrl?.toString() || null;
        } catch (error) {
          console.error('Error generating Appwrite URL:', error);
        }
      }
      
      return 'https://via.placeholder.com/1200x600/cccccc/666666?text=No+Image';
    } catch (error) {
      console.error('Error in getImageUrl:', error);
      return 'https://via.placeholder.com/1200x600/cccccc/666666?text=Image+Error';
    }
  };

  useEffect(() => {
    const fetchArticleDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get the article from localStorage first
        const storedArticle = localStorage.getItem(`article_${id}`);
        
        if (storedArticle) {
          try {
            const parsedArticle = JSON.parse(storedArticle);
            setArticle(parsedArticle);
            setIsLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing stored article:', parseError);
            localStorage.removeItem(`article_${id}`);
          }
        }

        // If no stored article, try to find it in the cached news data
        const categories = ['business', 'sports', 'technology', 'entertainment', 'health', 'general'];
        let foundArticle = null;

        for (const category of categories) {
          try {
            const cachedData = localStorage.getItem(`${category}Data`);
            if (cachedData) {
              const articles = JSON.parse(cachedData);
              foundArticle = articles.find(article => 
                article.id === id || 
                article.id === parseInt(id) || 
                article.article_id === id
              );
              if (foundArticle) break;
            }
          } catch (e) {
            console.error(`Error parsing ${category} cache:`, e);
          }
        }

        if (foundArticle) {
          setArticle(foundArticle);
          localStorage.setItem(`article_${id}`, JSON.stringify(foundArticle));
        } else {
          // Last resort: try the API call with better error handling
          try {
            const response = await fetch(`/api/articles/${id}`);
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Server returned non-JSON response (likely 404 or 500 error page)');
            }
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Normalize content structure
            if (data.content) {
              if (typeof data.content === 'string') {
                data.content = data.content.replace(/\n\s*\n/g, '\n\n').trim();
              } else if (typeof data.content === 'string' && data.content.trim().startsWith('{')) {
                try {
                  data.content = JSON.parse(data.content);
                } catch (e) {
                  console.warn('Failed to parse content as JSON', e);
                }
              }
            }

            setArticle(data);
            localStorage.setItem(`article_${id}`, JSON.stringify(data));
            
          } catch (apiError) {
            console.error('API Error:', apiError);
            throw new Error('Article not found. It may have been removed or the link is invalid.');
          }
        }
        
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err.message || 'Failed to load article. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArticleDetails();
    } else {
      setError('No article ID provided');
      setIsLoading(false);
    }
  }, [id]);

  const getArticleImage = (article) => {
    if (!article) return null;
    const imageField = article.featuredimage || article.image || article.thumbnail || article.image_url;
    if (typeof imageField === 'object' && imageField !== null) {
      return imageField.url || imageField.src || imageField.href || null;
    }
    return imageField;
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <div className="text-gray-600 text-sm sm:text-base">Loading article...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <div className="text-red-600 text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Article Not Found</h2>
        <p className="text-red-600 text-sm sm:text-base mb-6">{error}</p>
        <button
          onClick={handleBackClick}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (!article) return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="text-center">
        <div className="text-gray-600 text-sm sm:text-base mb-4">Article not found</div>
        <button
          onClick={handleBackClick}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-700 hover:text-red-600 transition-colors duration-200 -ml-2 px-2 py-1 rounded-md hover:bg-gray-100"
            >
              <FiArrowLeft className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ 
                    title: article.title, 
                    url: window.location.href 
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Share article"
            >
              <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-4xl mx-auto">
        <article className="w-full">
          {/* Article Header */}
          <header className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight sm:leading-tight md:leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
              <span className="flex items-center">
                <FiCalendar className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{formatDate(article.date || article.pubDate)}</span>
              </span>
              {article.source_name && (
                <span className="flex items-center">
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="truncate sm:ml-2">{article.source_name}</span>
                </span>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {getArticleImage(article) ? (
            <div className="mb-6 sm:mb-8 rounded-lg sm:rounded-xl overflow-hidden shadow-lg bg-gray-200 w-full">
              <div className="relative w-full aspect-video sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[2/1]">
                <img
                  src={getImageUrl(getArticleImage(article))}
                  alt={article.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                        <svg class="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mb-2 sm:mb-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <p class="text-xs sm:text-sm lg:text-base font-medium text-center px-4">Image not available</p>
                      </div>
                    `;
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8 rounded-lg sm:rounded-xl overflow-hidden shadow-lg bg-gray-100 w-full">
              <div className="relative w-full aspect-video sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[2/1]">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mb-2 sm:mb-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <p className="text-xs sm:text-sm lg:text-base font-medium text-center px-4">No image available</p>
                </div>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8 w-full">
            <div className="max-w-none">
              <div className="text-gray-900 leading-relaxed sm:leading-loose">
                {renderContent(article.content, article.description)}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
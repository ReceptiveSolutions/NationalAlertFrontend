import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiShare2 } from 'react-icons/fi';
import DOMPurify from 'dompurify';
import { storage } from '../appwrite/appwriteConfig';
import conf from '../conf/conf';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const renderContent = (content) => {
    try {
      if (!content) return null;

      // Handle HTML strings
      if (typeof content === 'string' && content.startsWith('<')) {
        return (
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
          />
        );
      }

      // Handle simple string (split into paragraphs)
      if (typeof content === 'string') {
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
        return paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-4 text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed sm:leading-loose">
            {paragraph}
          </p>
        ));
      }

      // Handle array of content
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

      // Fallback for other objects
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
      try {
        const storedArticle = localStorage.getItem(`article_${id}`);
        if (storedArticle) {
          const parsedArticle = JSON.parse(storedArticle);
          setArticle(parsedArticle);
        } else {
          const response = await fetch(`/api/articles/${id}`);
          if (!response.ok) throw new Error('Article not found');
          let data = await response.json();

          // Normalize content structure
          if (data.content) {
            // If content is a string with multiple paragraphs
            if (typeof data.content === 'string') {
              data.content = data.content
                .replace(/\n\s*\n/g, '\n\n')
                .trim();
            }
            // If content is a string that might be JSON
            else if (typeof data.content === 'string' && data.content.trim().startsWith('{')) {
              try {
                data.content = JSON.parse(data.content);
              } catch (e) {
                console.warn('Failed to parse content as JSON', e);
              }
            }
          }

          setArticle(data);
          localStorage.setItem(`article_${id}`, JSON.stringify(data));
        }
      } catch (err) {
        setError('Failed to load article.');
        console.error('Error fetching article:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id]);

  const getArticleImage = (article) => {
    if (!article) return null;
    const imageField = article.featuredimage || article.image || article.thumbnail;
    if (typeof imageField === 'object' && imageField !== null) {
      return imageField.url || imageField.src || imageField.href || null;
    }
    return imageField;
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
      <div className="text-center">
        <div className="text-red-600 text-lg mb-2">⚠️</div>
        <div className="text-red-600 text-sm sm:text-base">{error}</div>
      </div>
    </div>
  );
  
  if (!article) return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="text-center text-gray-600 text-sm sm:text-base">Article not found</div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-12 sm:h-14 lg:h-16">
            <Link 
              to="/" 
              className="flex items-center text-gray-700 hover:text-red-600 transition-colors duration-200 -ml-2 px-2 py-1 rounded-md hover:bg-gray-100"
            >
              <FiArrowLeft className="mr-1.5 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </Link>
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center">
                <FiCalendar className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{article.date}</span>
              </span>
              {article.author && (
                <span className="flex items-center">
                  <FiUser className="mr-1.5 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{article.author}</span>
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
            {article.summary && (
              <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100">
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-800 leading-relaxed sm:leading-loose font-medium">
                  {article.summary}
                </p>
              </div>
            )}
            
            {/* Main Content with Better Typography */}
            <div className="max-w-none">
              <div className="text-gray-900 leading-relaxed sm:leading-loose">
                {renderContent(article.content)}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
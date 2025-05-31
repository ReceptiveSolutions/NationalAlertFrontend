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
        return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />;
      }

      // Handle simple string (split into paragraphs)
      if (typeof content === 'string') {
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
        return paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>
        ));
      }

      // Handle array of content
      if (Array.isArray(content)) {
        return content.map((item, index) => {
          if (typeof item === 'string') {
            return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{item}</p>;
          }
          if (item.subheading && item.text) {
            return (
              <div key={index} className="mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">{item.subheading}</h3>
                <p className="text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            );
          }
          return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{JSON.stringify(item)}</p>;
        });
      }

      // Fallback for other objects
      if (typeof content === 'object') {
        return <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>;
      }

      return <p className="text-gray-700 leading-relaxed">{String(content)}</p>;
    } catch (error) {
      console.error('Error rendering content:', error);
      return <div className="text-red-500 p-4 bg-red-50 rounded-lg">Error displaying content</div>;
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
        <div className="text-gray-600">Loading article...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="text-center">
        <div className="text-red-600 text-lg mb-2">⚠️</div>
        <div className="text-red-600">{error}</div>
      </div>
    </div>
  );
  
  if (!article) return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="text-center text-gray-600">Article not found</div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link 
              to="/" 
              className="flex items-center text-gray-700 hover:text-red-600 transition-colors duration-200 -ml-2 px-2 py-1 rounded-md hover:bg-gray-100"
            >
              <FiArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back</span>
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
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <article>
          {/* Article Header */}
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <FiCalendar className="mr-1.5 w-4 h-4" />
                {article.date}
              </span>
              {article.author && (
                <span className="flex items-center">
                  <FiUser className="mr-1.5 w-4 h-4" />
                  {article.author}
                </span>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {getArticleImage(article) ? (
            <div className="mb-6 sm:mb-8 rounded-lg sm:rounded-xl overflow-hidden shadow-lg bg-gray-200">
              <img
                src={getImageUrl(getArticleImage(article))}
                alt={article.title}
                className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-48 sm:h-64 bg-gray-100 text-gray-500">
                      <svg class="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                      <p class="text-sm sm:text-base font-medium">Image not available</p>
                    </div>
                  `;
                }}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="mb-6 sm:mb-8 rounded-lg sm:rounded-xl overflow-hidden shadow-lg bg-gray-100">
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <p className="text-sm sm:text-base font-medium">No image available</p>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8">
            {article.summary && (
              <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100">
                <p className="text-base sm:text-lg text-gray-800 leading-relaxed font-medium">
                  {article.summary}
                </p>
              </div>
            )}
            
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
              <div className="text-gray-900 leading-relaxed">
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
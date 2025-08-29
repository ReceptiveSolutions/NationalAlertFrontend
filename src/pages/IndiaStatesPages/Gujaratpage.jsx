import React, { useState, useEffect } from 'react';
import { 
  FiMapPin, 
  FiClock, 
  FiUser, 
  FiArrowRight, 
  FiChevronUp, 
  FiChevronDown,
  FiRefreshCw,
  FiTrendingUp
} from 'react-icons/fi';

const GujaratPage = ({ onArticleStore, navigate }) => {
  const [articles, setArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedArticles, setExpandedArticles] = useState({});
  const maxWords = 50;

  const getFallbackImage = (index = 0) => {
    const gujaratImages = [
      'gujarat,cityscape',
      'surat,diamond-city', 
      'ahmedabad,sabarmati-ashram',
      'gujarat,culture',
      'surat,textile-industry',
      'gujarat,food'
    ];
    return `https://source.unsplash.com/800x500/?${gujaratImages[index % gujaratImages.length]}`;
  };

  const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const hasMoreThanMaxWords = (text) => {
    const wordCount = countWords(text);
    return wordCount > maxWords;
  };

  const getButtonText = (article, isExpanded) => {
    const wordCount = countWords(article.description);
    if (wordCount > maxWords) {
      return "Read Full Article";
    }
    return isExpanded ? "Show Less" : "Read More";
  };

  const getIcon = (article, isExpanded) => {
    const wordCount = countWords(article.description);
    if (wordCount > maxWords) {
      return <FiArrowRight className="ml-1" size={14} />;
    }
    return isExpanded ? <FiChevronUp className="ml-1" size={14} /> : <FiChevronDown className="ml-1" size={14} />;
  };

  const truncateText = (text, wordLimit) => {
    if (!text || typeof text !== 'string') return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const fetchGujaratNews = async (attempt = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/api/news/category/last24h?category=surat`);
      
      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      
      const data = await response.json();

      let articles;
      if (Array.isArray(data)) {
        articles = data;
      } else if (data.data && Array.isArray(data.data)) {
        articles = data.data;
      } else if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      } else {
        const keys = Object.keys(data);
        const arrayKey = keys.find(key => Array.isArray(data[key]));
        if (arrayKey) {
          articles = data[arrayKey];
        } else {
          throw new Error('No articles found in API response');
        }
      }

      if (Array.isArray(articles) && articles.length > 0) {
        const processedArticles = articles.map((item, index) => {
          let subcategory = 'Local News';
          const content = (item.title + ' ' + (item.description || item.summary || '')).toLowerCase();
          
          return {
            id: item.article_id || item.id || `gujarat_${index}`,
            title: item.title || 'Gujarat News Update',
            description: item.description || item.summary || item.content || 'No Description Available' ,
            summary: item.description || item.summary || item.content || 'No Description Available',
            image_url: item.image_url || item.image || item.urlToImage || getFallbackImage(index),
            image: item.image_url || item.image || item.urlToImage || getFallbackImage(index),
            date: item.pubDate || item.publishedAt || item.date ? 
              new Date(item.pubDate || item.publishedAt || item.date).toLocaleDateString() : 
              new Date().toLocaleDateString(),
            author: item.author || 'Gujarat Reporter',
            category: 'Gujarat',
            subcategory: subcategory,
            readTime: `${Math.max(1, Math.floor((item.description?.length || 200) / 200))} min read`,
            content: [{
              subheading: 'Gujarat News',
              text: item.description || item.summary || item.content || 'Full article content would be displayed here.',
            }],
            isRssData: true,
            timestamp: Date.now(),
            cycle: new Date().toLocaleString(),
            wordCount: countWords(item.description || item.summary || item.content || ''),
            isHot: Math.random() > 0.5,
          };
        });

        setArticles(processedArticles);
        setFeaturedArticle(processedArticles[0]);
      } else {
        throw new Error('No articles found in processed data');
      }
      
    } catch (error) {
      console.error(`Failed to fetch Gujarat news (attempt ${attempt + 1}):`, error);
      
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          fetchGujaratNews(attempt + 1);
        }, delay);
      } else {
        setError('Failed to load Gujarat news. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGujaratNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchGujaratNews();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleArticleClick = (article) => {
    const wordCount = countWords(article.description);
    const isExpanded = expandedArticles[article.id];
    
    // If article has more than maxWords, navigate to full article page
    if (wordCount > maxWords) {
      const completeArticle = {
        ...article,
        id: article.id,
        title: article.title || 'Gujarat News Update',
        summary: article.description || 'Click to read the full article',
        image: article.image_url || article.image || getFallbackImage(0),
        date: article.date || new Date().toLocaleDateString(),
        author: article.author || 'Gujarat Reporter',
        category: article.category || 'Gujarat',
        subcategory: article.subcategory || 'Local News',
        readTime: article.readTime || '3 min read',
        isBreaking: Math.random() > 0.7,
        content: article.content || [{
          subheading: 'Gujarat News',
          text: article.description || 'Full article content would be displayed here.',
        }],
        isRssData: article.isRssData || true,
      };

      if (onArticleStore) {
        onArticleStore(completeArticle);
      }

      if (navigate) {
        navigate(`/article/${article.id}`);
      } else {
        console.log('Navigating to full article:', completeArticle);
        window.location.href = `/article/${article.id}`;
      }
    } else {
      // Toggle expand/collapse for shorter articles
      setExpandedArticles(prev => ({
        ...prev,
        [article.id]: !isExpanded
      }));
    }
  };

  const handleToggleExpand = (e, articleId) => {
    e.stopPropagation(); // Prevent triggering article click
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const handleImageError = (e, index) => {
    e.target.src = getFallbackImage(index);
  };

  if (isLoading && !articles.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
              <FiRefreshCw className="w-8 h-8 animate-spin text-gray-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading Gujarat News</h2>
            <p className="text-gray-600">Please wait while we fetch the latest updates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !articles.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load News</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => fetchGujaratNews()}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
             Gujarat
              
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Stay updated with breaking news and trending stories from Gujarat
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Big Cards (First 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {articles.slice(0, 2).map((article, index) => {
              const isExpanded = expandedArticles[article.id];
              const wordCount = countWords(article.description);
              
              return (
                <article
                  key={article.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={article.image_url || article.image || getFallbackImage(index)} 
                      alt={article.title} 
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => handleImageError(e, index)}
                    />
                    
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 text-gray-700 px-3 py-1 text-xs font-medium rounded-full">
                        {article.subcategory}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Meta */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        <span>{article.date}</span>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-gray-700 transition-colors">
                      {article.title}
                    </h3>
                    
                    {/* Description */}
                    <div className="text-gray-600 mb-6 leading-relaxed">
                      {isExpanded ? (
                        <p>{article.description}</p>
                      ) : (
                        <p>{truncateText(article.description, maxWords)}</p>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button 
                        onClick={(e) => {
                          const wordCount = countWords(article.description);
                          if (wordCount > maxWords) {
                            handleArticleClick(article);
                          } else {
                            handleToggleExpand(e, article.id);
                          }
                        }}
                        className="group/btn bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all duration-200 flex items-center"
                      >
                        {getButtonText(article, isExpanded)}
                        <div className="ml-2 transform group-hover/btn:translate-x-1 transition-transform">
                          {getIcon(article, isExpanded)}
                        </div>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          

          {/* Medium Cards (Next 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {articles.slice(2, 6).map((article, index) => {
              const actualIndex = index + 2;
              const isExpanded = expandedArticles[article.id];
              const wordCount = countWords(article.description);
              const mediumCardWordLimit = 15; // Specific limit for medium cards
              
              return (
                <article
                  key={article.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={article.image_url || article.image || getFallbackImage(actualIndex)} 
                      alt={article.title} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => handleImageError(e, actualIndex)}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3">
                      {article.isHot ? (
                        <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                          HOT
                        </span>
                      ) : (
                        <span className="bg-gray-900 text-white px-2 py-1 text-xs font-medium rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Meta */}
                    <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="w-3 h-3 mr-1" />
                        <span>{article.date}</span>
                      </div>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">{article.subcategory}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-gray-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    {/* Description */}
                    <div className="text-gray-600 mb-4 text-sm">
                      {wordCount > mediumCardWordLimit ? (
                        <p>
                          {isExpanded 
                            ? article.description 
                            : truncateText(article.description, mediumCardWordLimit)
                          }
                        </p>
                      ) : (
                        <p>{article.description}</p>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{article.readTime}</span>
                      {wordCount > mediumCardWordLimit ? (
                        <button 
                          onClick={(e) => handleToggleExpand(e, article.id)}
                          className="text-gray-900 hover:text-gray-700 text-xs font-medium flex items-center"
                        >
                          {isExpanded ? 'Show Less' : 'Read More'}
                          {isExpanded ? (
                            <FiChevronUp className="w-3 h-3 ml-1" />
                          ) : (
                            <FiChevronDown className="w-3 h-3 ml-1" />
                          )}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleArticleClick(article)}
                          className="text-gray-900 hover:text-gray-700 text-xs font-medium flex items-center"
                        >
                          Read Full
                          <FiArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Regular Grid (Remaining articles) */}
          {articles.length > 6 && (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">More Stories</h2>
                <div className="w-20 h-1 bg-gray-900 mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.slice(6).map((article, index) => {
                  const actualIndex = index + 6;
                  const isExpanded = expandedArticles[article.id];
                  const wordCount = countWords(article.description);
                  
                  return (
                    <article
                      key={article.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <img 
                          src={article.image_url || article.image || getFallbackImage(actualIndex)} 
                          alt={article.title} 
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => handleImageError(e, actualIndex)}
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 text-gray-700 px-3 py-1 text-xs font-medium rounded-full">
                            {article.subcategory}
                          </span>
                        </div>
                      </div>

                      

                      {/* Content */}
                      <div className="p-6">
                        {/* Meta */}
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiClock className="w-4 h-4 mr-1" />
                            <span>{article.date}</span>
                          </div>
                          <div className="flex items-center">
                            <FiUser className="w-4 h-4 mr-1" />
                            <span>{article.author}</span>
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-gray-700 transition-colors">
                          {article.title}
                        </h3>
                        
                        {/* Description */}
                        <div className="text-gray-600 mb-6 leading-relaxed">
                          {isExpanded ? (
                            <p className="text-sm">{article.description}</p>
                          ) : (
                            <p className="text-sm">{truncateText(article.description, maxWords)}</p>
                          )}
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <button 
                            onClick={(e) => {
                              const wordCount = countWords(article.description);
                              if (wordCount > maxWords) {
                                handleArticleClick(article);
                              } else {
                                handleToggleExpand(e, article.id);
                              }
                            }}
                            className="group/btn bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all duration-200 flex items-center"
                          >
                            {getButtonText(article, isExpanded)}
                            <div className="ml-2 transform group-hover/btn:translate-x-1 transition-transform">
                              {getIcon(article, isExpanded)}
                            </div>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default GujaratPage;
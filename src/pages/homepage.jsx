import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import Newsapi from '../api/newsapi';
import BBCNewsFetcher from '../Rss/BBCNews'; // Your RSS component

const NewsHomepage = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [rssNews, setRssNews] = useState([]); // New state for RSS data
  const [apiNews, setApiNews] = useState([]); // Store API data separately
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState(null);
  const [apiDataLoaded, setApiDataLoaded] = useState(false);
  const [rssDataFetched, setRssDataFetched] = useState(false);
  const [rssCurrentIndex, setRssCurrentIndex] = useState(0); // Track RSS articles shown
  
  // Separate state objects for different sections
  const [expandedFeaturedArticles, setExpandedFeaturedArticles] = useState({});
  const [expandedTrendingArticles, setExpandedTrendingArticles] = useState({});
  const [expandedLatestArticles, setExpandedLatestArticles] = useState({});
  
  const [displayCount, setDisplayCount] = useState(6);
  const [additionalRssArticles, setAdditionalRssArticles] = useState([]); // Only RSS articles for load more
  
  const navigate = useNavigate();

  // Helper function to generate unique IDs to avoid conflicts
  const generateUniqueId = (title, source, index) => {
    return `${source}_${title.slice(0, 20).replace(/\s+/g, '_')}_${index}`;
  };

  // Helper function to check for duplicate articles
  const isDuplicate = (newArticle, existingArticles) => {
    return existingArticles.some(existing => {
      // Check for similar titles (allowing for minor variations)
      const titleSimilarity = similarity(
        newArticle.title.toLowerCase().trim(),
        existing.title.toLowerCase().trim()
      );
      return titleSimilarity > 0.8; // 80% similarity threshold
    });
  };

  // Simple string similarity function
  const similarity = (s1, s2) => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const editDistance = getEditDistance(longer, shorter);
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance) / longer.length;
  };

  // Levenshtein distance calculation
  const getEditDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = [];
    for (let i = 0; i <= s2.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s1.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s2.charAt(i - 1) !== s1.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s1.length] = lastValue;
    }
    return costs[s1.length];
  };

  // Helper function to check if article has more than 50 words
  const hasMoreThan50Words = (summary) => {
    const wordCount = summary ? summary.split(/\s+/).length : 0;
    return wordCount > 50;
  };

  // Process API data only
  const processApiData = (apiData) => {
    if (!apiData || apiData.length === 0) return [];
    
    return apiData.map((item, index) => ({
      id: generateUniqueId(item.title || 'API Article', 'api', index),
      title: item.title || 'No title available',
      summary: item.summary || item.description || 'No description available',
      image: item.image || `https://source.unsplash.com/800x500/?news,${index}`,
      date: item.date || new Date().toLocaleDateString(),
      category: determineCategory(item.title || '', index),
      readTime: `${Math.max(1, Math.floor((item.summary?.length || item.description?.length || 0) / 200))} min read`,
      author: item.author || 'News Staff',
      isBreaking: index % 7 === 0,
      source: 'api',
      link: item.link || item.url || '',
      content: index % 3 === 0 ? generateAdditionalContent() : []
    }));
  };

  // Process RSS data only
  const processRssData = (rssData) => {
    if (!rssData || rssData.length === 0) return [];
    
    return rssData.map((item, index) => ({
      id: generateUniqueId(item.title || 'RSS Article', 'rss', index),
      title: item.title || 'No title available',
      summary: item.summary || item.description || 'No description available',
      image: item.image || `https://source.unsplash.com/800x500/?news,rss,${index}`,
      date: item.date || new Date().toLocaleDateString(),
      category: determineCategory(item.title || '', index),
      readTime: `${Math.max(1, Math.floor((item.summary?.length || item.description?.length || 0) / 200))} min read`,
      author: item.author || 'BBC News',
      isBreaking: false,
      source: 'rss',
      link: item.link || '',
      content: generateAdditionalContent()
    }));
  };

  // Handle API data loading
  const handleApiDataLoaded = (apiData) => {
    try {
      if (!apiData || apiData.length === 0) {
        console.warn('No API data available');
        setError('Unable to load news content from API');
        setIsLoading(false);
        return;
      }

      const processedApiData = processApiData(apiData);
      setApiNews(processedApiData);
      
      // Set initial display data using only API data
      setFeaturedNews(processedApiData.slice(0, 6));
      setLatestNews(processedApiData.slice(6, Math.min(processedApiData.length, 30)));
      
      // Create trending news from API data
      setTrendingNews(processedApiData.slice(0, 5).map((item, idx) => ({
        ...item,
        trend: idx % 2 === 0 ? 'up' : 'down'
      })));
      
      setApiDataLoaded(true);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing API data:', err);
      setError('Unable to load news content from API');
      setIsLoading(false);
    }
  };

  // Handle RSS data loading (only called when Load More is clicked)
  const handleRssDataLoaded = (rssData) => {
    try {
      if (!rssData || rssData.length === 0) {
        console.warn('No RSS data available');
        setIsLoadingMore(false);
        return;
      }

      const processedRssData = processRssData(rssData);
      setRssNews(processedRssData);
      setRssDataFetched(true);
      
      // Add first 4 RSS articles to additional articles
      const newRssArticles = processedRssData.slice(0, 4);
      setAdditionalRssArticles(newRssArticles);
      setRssCurrentIndex(4);
      setIsLoadingMore(false);
    } catch (err) {
      console.error('Error processing RSS data:', err);
      setIsLoadingMore(false);
    }
  };

  // Process combined data once both sources are loaded
  const processCombinedData = (apiData, rssData) => {
    // This function is no longer needed since we handle API and RSS separately
  };

  // Check if both data sources are loaded
  useEffect(() => {
    // Only check for API data loading since RSS is loaded on demand
    if (apiDataLoaded) {
      setIsLoading(false);
    }
  }, [apiDataLoaded]);

  // Load more articles function - now fetches RSS data on demand
  const loadMoreArticles = () => {
    setIsLoadingMore(true);
    
    if (!rssDataFetched) {
      // First time clicking Load More - fetch RSS data
      // RSS component will be conditionally rendered to fetch data
      setRssDataFetched(true);
    } else {
      // RSS data already fetched, load next 4 articles
      const nextArticles = rssNews.slice(rssCurrentIndex, rssCurrentIndex + 4);
      if (nextArticles.length > 0) {
        setAdditionalRssArticles(prev => [...prev, ...nextArticles]);
        setRssCurrentIndex(prev => prev + 4);
      }
      setIsLoadingMore(false);
    }
  };

  // Toggle functions remain the same but use the new ID system
  const toggleExpandFeatured = (article) => {
    // Check if the description is more than 50 words
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50) {
      // Store article data in localStorage for detail page to access
      localStorage.setItem(`article_${article.id}`, JSON.stringify(article));
      // Navigate to the detail page
      navigate(`/article/${article.id}`);
    } else {
      // For shorter articles, just toggle expansion in-place
      setExpandedFeaturedArticles(prev => ({
        ...prev,
        [article.id]: !prev[article.id]
      }));
    }
  };


  // Toggle expanded state for a trending article
  const toggleExpandTrending = (article) => {
    // Check if the description is more than 50 words
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50) {
      // Store article data in localStorage for detail page to access
      localStorage.setItem(`article_${article.id}`, JSON.stringify(article));
      // Navigate to the detail page
      navigate(`/article/${article.id}`);
    } else {
      // For shorter articles, just toggle expansion in-place
      setExpandedTrendingArticles(prev => ({
        ...prev,
        [article.id]: !prev[article.id]
      }));
    }
  };


  // Toggle expanded state for a latest article
  const toggleExpandLatest = (article) => {
    // Check if the description is more than 50 words
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50) {
      // Store article data in localStorage for detail page to access
      localStorage.setItem(`article_${article.id}`, JSON.stringify(article));
      // Navigate to the detail page
      navigate(`/article/${article.id}`);
    } else {
      // For shorter articles, just toggle expansion in-place
      setExpandedLatestArticles(prev => ({
        ...prev,
        [article.id]: !prev[article.id]
      }));
    }
  };


  
  // Generate additional content sections for detail pages
  const generateAdditionalContent = () => {
    return [];
  };

  // Simple function to assign a general category
  const determineCategory = (title, index) => {
    return "news";
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gray-100 text-gray-100 py-10 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 animate-pulse">
            <div className="h-4 bg-white w-32 mb-2 rounded"></div>
            <div className="h-8 bg-white w-3/4 mb-3 rounded"></div>
            <div className="h-4 bg-white w-1/2 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className={`bg-black shadow-md overflow-hidden ${index < 2 ? 'lg:col-span-2' : ''}`}
              >
                <div className="relative animate-pulse">
                  <div className={`w-full ${index < 2 ? 'h-72' : 'h-40'} bg-gray-700`}></div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2 animate-pulse">
                    <div className="h-3 bg-gray-100 w-16 rounded"></div>
                  </div>
                  <div className="h-5 bg-gray-100 w-3/4 mb-2 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-600 w-full mb-1 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-600 w-2/3 mb-3 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Error display component
  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load News</h2>
        <p className="text-gray-600 mb-6">We're experiencing technical difficulties retrieving the latest news. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition duration-300"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Load only API data initially */}
      <Newsapi onDataLoaded={handleApiDataLoaded} />
      
      {/* Conditionally load RSS data only when needed */}
      {rssDataFetched && !rssNews.length && (
        <BBCNewsFetcher onDataLoaded={handleRssDataLoaded} />
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorDisplay />
      ) : (
        <section>
          <section className="relative">
            <div className="bg-gray-100 text-gray-900 py-10 px-6 lg:px-10">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FiTrendingUp className="mr-2" />
                    <span className="text-sm font-medium">TRENDING NOW</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">Stay Informed with Today's Top Stories</h1>
                  <p className="text-base md:text-lg opacity-90 max-w-3xl">
                    Get the latest news and developments from around the world
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  {featuredNews.map((article, index) => (
                    <div 
                      key={article.id} 
                      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${index < 2 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
                    >
                      <div className="relative">
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className={`w-full ${index < 2 ? 'h-48 sm:h-64 md:h-72' : 'h-32 sm:h-40'} object-cover`} 
                          onError={(e) => {
                            e.target.src = `https://source.unsplash.com/random/800x500/?news,${index}`;
                          }}
                        />
                        {article.isBreaking && (
                          <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 text-xs font-bold">
                            BREAKING
                          </div>
                        )}
                        {/* Source badge */}
                        {/* <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white px-3 py-1 text-xs font-bold">
                          API
                        </div> */}
                      </div>

                      <div className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs text-black">{article.date}</span>
                          </div>
                        </div>
                        
                        <h2 className="text-sm sm:text-base lg:text-lg font-bold mb-2 text-black bg-white rounded p-2">
                          {article.title}
                        </h2>
                        <div className="text-xs sm:text-sm text-black mb-3">
                          {expandedFeaturedArticles[article.id] ? (
                            <p>{article.summary}</p>
                          ) : (
                            <p className="line-clamp-2">{article.summary}</p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div></div>
                          <button 
                            onClick={() => toggleExpandFeatured(article)}
                            className="text-red-600 hover:text-red-400 text-xs font-medium flex items-center cursor-pointer"
                          >
                            {hasMoreThan50Words(article.summary) ? (
                              <>View full article <FiExternalLink className="ml-1" size={14} /></>
                            ) : expandedFeaturedArticles[article.id] ? (
                              <>Read less <FiChevronUp className="ml-1" size={14} /></>
                            ) : (
                              <>Read more <FiChevronDown className="ml-1" size={14} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Sidebar */}
              <div className="order-2 lg:order-1 space-y-6 lg:space-y-8">
                {/* Trending Now */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <FiTrendingUp className="text-red-600 mr-2" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Trending Now</h2>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {trendingNews.map((article, index) => (
                      <div key={article.id} className="flex items-start pb-3 sm:pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <span className="text-lg sm:text-2xl font-bold text-gray-300 mr-2 sm:mr-3 flex-shrink-0">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 cursor-pointer line-clamp-2">{article.title}</h3>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {expandedTrendingArticles[article.id] ? (
                              <p>{article.summary}</p>
                            ) : (
                              <p className="line-clamp-2">{article.summary.substring(0, 60)}...</p>
                            )}
                          </div>
                          <button 
                            onClick={() => toggleExpandTrending(article)}
                            className="text-red-600 hover:text-red-500 text-xs font-medium flex items-center mt-2 cursor-pointer"
                          >
                            {hasMoreThan50Words(article.summary) ? (
                              <>View full article <FiExternalLink className="ml-1" size={12} /></>
                            ) : expandedTrendingArticles[article.id] ? (
                              <>Read less <FiChevronUp className="ml-1" size={12} /></>
                            ) : (
                              <>Read more <FiChevronDown className="ml-1" size={12} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest News Section */}
              <div className="order-1 lg:order-2 lg:col-span-2">
                <div className="space-y-4 sm:space-y-6">
                  {latestNews.slice(0, displayCount).map(article => (
                    <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 w-full sm:w-32 md:w-48 h-48 sm:h-32 md:h-auto overflow-hidden relative">
                          <img 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                            src={article.image} 
                            alt={`News image: ${article.title}`}
                            onError={(e) => {
                              e.target.src = `https://source.unsplash.com/random/300x200/?news,${article.id}`;
                              e.target.alt = "News placeholder image";
                            }}
                          />
                          {/* Source badge */}
                          {/* <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
                            API
                          </div> */}
                        </div>
                        <div className="p-4 sm:p-4 md:p-6 flex-1 min-w-0">
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">{article.date}</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 cursor-pointer transition-colors duration-200 line-clamp-2">{article.title}</h3>
                          
                          <div className="text-sm sm:text-base text-gray-600 mb-4 overflow-hidden transition-all duration-300" style={{maxHeight: expandedLatestArticles[article.id] ? '1000px' : '3rem'}}>
                            <p className={expandedLatestArticles[article.id] ? '' : 'line-clamp-2'}>{article.summary}</p>
                          </div>
                          
                          <button 
                            onClick={() => toggleExpandLatest(article)}
                            className="text-red-600 hover:text-red-500 text-sm font-medium flex items-center transition-colors duration-200 cursor-pointer"
                            aria-expanded={expandedLatestArticles[article.id] ? "true" : "false"}
                          >
                            {hasMoreThan50Words(article.summary) ? (
                              <>View full article <FiExternalLink className="ml-1" size={14} /></>
                            ) : expandedLatestArticles[article.id] ? (
                              <>Read less <FiChevronUp className="ml-1" size={14} /></>
                            ) : (
                              <>Read more <FiChevronDown className="ml-1" size={14} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* RSS Articles - Only shown after Load More is clicked */}
                  {additionalRssArticles.map(article => (
                    <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 w-full sm:w-32 md:w-48 h-48 sm:h-32 md:h-auto overflow-hidden relative">
                          <img 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                            src={article.image} 
                            alt={`News image: ${article.title}`}
                            onError={(e) => {
                              e.target.src = `https://source.unsplash.com/random/300x200/?news,${article.id}`;
                              e.target.alt = "News placeholder image";
                            }}
                          />
                          RSS Source badge
                          {/* <div className="absolute bottom-2 left-2 bg-blue-600 bg-opacity-90 text-white px-2 py-1 text-xs rounded font-bold">
                            RSS
                          </div> */}
                        </div>
                        <div className="p-4 sm:p-4 md:p-6 flex-1 min-w-0">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{article.date}</span>
                            {/* <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              {article.author}
                            </span> */}
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 cursor-pointer transition-colors duration-200 line-clamp-2">{article.title}</h3>
                          
                          <div className="text-sm sm:text-base text-gray-600 mb-4 overflow-hidden transition-all duration-300" style={{maxHeight: expandedLatestArticles[article.id] ? '1000px' : '3rem'}}>
                            <p className={expandedLatestArticles[article.id] ? '' : 'line-clamp-2'}>{article.summary}</p>
                          </div>
                          
                          <button 
                            onClick={() => toggleExpandLatest(article)}
                            className="text-red-600  text-sm font-medium flex items-center transition-colors duration-200 cursor-pointer"
                            aria-expanded={expandedLatestArticles[article.id] ? "true" : "false"}
                          >
                            {hasMoreThan50Words(article.summary) ? (
                              <>View full article <FiExternalLink className="ml-1" size={14} /></>
                            ) : expandedLatestArticles[article.id] ? (
                              <>Read less <FiChevronUp className="ml-1" size={14} /></>
                            ) : (
                              <>Read more <FiChevronDown className="ml-1" size={14} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {(!rssDataFetched || (rssNews.length > 0 && rssCurrentIndex < rssNews.length)) && (
                    <div className="flex justify-center mt-6 sm:mt-8">
                      <button 
                        onClick={loadMoreArticles}
                        disabled={isLoadingMore}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm sm:text-base"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {!rssDataFetched ? 'Loading News...' : 'Loading More...'}
                          </>
                        ) : (
                          <>
                            {!rssDataFetched ? 'Load More News' : 'Load More News'}
                            <span className="ml-2 text-lg">→</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* End of articles message */}
                  {/* {rssDataFetched && rssCurrentIndex >= rssNews.length && (
                    <div className="text-center mt-6 sm:mt-8 py-4">
                      <p className="text-gray-600">You've reached the end of available articles.</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Showing {latestNews.length} API articles + {additionalRssArticles.length} RSS articles
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </main>
        </section>
      )}
    </div>
  );
};

export default NewsHomepage;
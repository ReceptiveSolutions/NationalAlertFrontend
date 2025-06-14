import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SportsApi from '../api/sportsnews';
import { Newspaper } from 'lucide-react';

const SportsPage = () => {
  const navigate = useNavigate();
  const [sportsNews, setSportsNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredNews, setFilteredNews] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [displayCount, setDisplayCount] = useState(8);
  const [showNoMoreNewsPopup, setShowNoMoreNewsPopup] = useState(false);
  
  // In-memory storage for articles (since localStorage isn't available)
  const [articleStorage, setArticleStorage] = useState({});
  
  console.log(`Current display count in SportsPage: ${displayCount}`);

  const handleDataLoaded = (data) => {
    console.log("Data loaded in SportsPage:", data);
    setSportsNews(data);
    setFilteredNews(data);
    setLoading(false);
  };
  
  const refreshNews = () => {
    setLoading(true);
    setSportsNews([]);
    setArticleStorage({}); // Clear article storage
  };

  const countWords = (str) => {
    return str.split(/\s+/).filter(Boolean).length;
  };

  const storeArticle = (article) => {
    const articleData = {
      ...article,
      date: article.date || new Date().toLocaleDateString(),
      author: article.author || 'Sports Reporter',
      readTime: article.readTime || `${Math.ceil(countWords(article.summary || '') / 200)} min read`,
      content: article.summary || article.content || 'No content available'
    };
    
    // Store in component state instead of localStorage
    setArticleStorage(prev => ({
      ...prev,
      [article.id]: articleData
    }));
    
    // Also try to store in localStorage if available
    try {
      if (typeof Storage !== 'undefined') {
        localStorage.setItem(`article_${article.id}`, JSON.stringify(articleData));
        // Store in category cache as well
        const existingSportsData = JSON.parse(localStorage.getItem('sportsData') || '[]');
        const updatedSportsData = existingSportsData.some(item => item.id === article.id) 
          ? existingSportsData 
          : [...existingSportsData, articleData];
        localStorage.setItem('sportsData', JSON.stringify(updatedSportsData));
      }
    } catch (error) {
      console.warn('localStorage not available, using in-memory storage');
    }
    
    return articleData;
  };

  //!! toggel discription 
  const toggleDescription = (id) => {
    console.log("Toggling description for id:", id);
    const article = [...filteredNews].find(news => news.id === id);
    
    if (article && article.summary && countWords(article.summary) > 50) {
      // Store the article data before navigation
      const storedArticle = storeArticle(article);
      console.log("Stored article:", storedArticle);
      
      // Navigate to detail page
      navigate(`/article/${article.id}`);
    } else {
      // For shorter articles, toggle description
      setExpandedDescriptions(prevState => ({
        ...prevState,
        [id]: !prevState[id]
      }));
    }
  };
  
  const loadMoreNews = () => {
    console.log("Loading more news. Current displayCount:", displayCount);
    
    if (filteredNews.length > 4 + displayCount) {
      setDisplayCount(prevCount => {
        const newCount = prevCount + 4;
        console.log("New displayCount will be:", newCount);
        return newCount;
      });
    } else {
      setShowNoMoreNewsPopup(true);
      setTimeout(() => {
        setShowNoMoreNewsPopup(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && sportsNews.length === 0) {
        console.log("Timeout reached - using fallback data");
        const fallbackData = [];
        const sportsCategories = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Formula 1'];
        
        for (let i = 0; i < 20; i++) {
          const category = sportsCategories[i % sportsCategories.length];
          fallbackData.push({
            id: i,
            title: `${category} News: This is a placeholder headline for ${category} news story ${i+1}`,
            summary: `This is placeholder content for a sports article that couldn't be loaded. This would normally contain a summary of the latest ${category.toLowerCase()} news. The article would include detailed information about recent matches, player performances, upcoming tournaments, and other relevant information from the world of ${category.toLowerCase()}.`,
            image: `https://source.unsplash.com/random/800x500/?${category.toLowerCase()},sports`,
            date: new Date().toLocaleDateString(),
            category: 'Sports',
            subcategory: category
          });
        }
        setSportsNews(fallbackData);
        setFilteredNews(fallbackData);
        setLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [loading, sportsNews]);

  // Store all articles when they're loaded
  useEffect(() => {
    if (filteredNews.length > 0) {
      filteredNews.forEach(article => {
        if (!articleStorage[article.id]) {
          storeArticle(article);
        }
      });
    }
  }, [filteredNews]);

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto"></div>
              <Newspaper className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Latest News</h2>
            <p className="text-gray-400">Fetching the most recent updates...</p>
          </div>
        </div>
    );
  }

  const featuredNews = filteredNews[0] || null;
  const topStories = filteredNews.slice(1, 4);
  const latestNews = filteredNews.slice(4, 4 + displayCount);
  
  const hasMoreNews = filteredNews.length > 4 + displayCount;

  const getButtonText = (news, isExpanded) => {
    if (countWords(news.summary) > 50) {
      return "View full article";
    } else {
      return isExpanded ? "Show less" : "Read more";
    }
  };

  const getButtonIcon = (news, isExpanded) => {
    if (countWords(news.summary) > 50) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      );
    }
  };

  // Helper function to truncate text for consistent card heights
  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };
  
  console.log("Featured news:", featuredNews ? "Available" : "Not available");
  console.log("Top stories count:", topStories.length);
  console.log("Latest news count:", latestNews.length);
  console.log("Total news items:", filteredNews.length);
  console.log("Has more news:", hasMoreNews);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 relative">
      <SportsApi onDataLoaded={handleDataLoaded} />
      
      {/* No More News Popup */}
      {showNoMoreNewsPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down px-4">
          <div className="bg-gray-800 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg flex items-center text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>No more news available! Stay tuned for updates.</span>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with refresh button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Sports News</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Latest updates from the world of sports</p>
          </div>
          <button 
            onClick={refreshNews}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md text-sm sm:text-base cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
            </svg>
            <span>Refresh News</span>
          </button>
        </div>
        
        {/* Featured News - Responsive Hero Section */}
        {featuredNews && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-64 sm:h-80 lg:h-full">
                  <div className="absolute lg:hidden inset-0 bg-gradient-to-b from-transparent to-black opacity-60 z-10"></div>
                  <img 
                    src={featuredNews.image} 
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://source.unsplash.com/random/1200x600/?sports`;
                    }}
                  />
                  {/* Mobile overlay content */}
                  <div className="absolute lg:hidden bottom-0 left-0 right-0 p-4 sm:p-6 z-20">
                    <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-full mb-2">
                      {featuredNews.subcategory || 'Breaking News'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">{featuredNews.title}</h2>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                  {/* Desktop category badge */}
                  <div className="mb-4 hidden lg:block">
                    <span className="inline-block px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                      {featuredNews.subcategory || 'Breaking News'}
                    </span>
                  </div>
                  
                  {/* Desktop title */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight hidden lg:block">
                    {featuredNews.title}
                  </h2>
                  
                  {/* Meta information */}
                  <div className="flex flex-wrap items-center text-gray-500 text-xs sm:text-sm mb-4 sm:mb-5">
                    <div className="flex items-center mr-4 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>{featuredNews.date}</span>
                    </div>
                    
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Staff Writer</span>
                    </div>
                  </div>
                  
                  {/* Summary and button */}
                  {featuredNews.summary && (
                    <div className="transition-all duration-300">
                      <p className={`text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base ${expandedDescriptions[featuredNews.id] ? '' : 'line-clamp-3 sm:line-clamp-4'}`}>
                        {featuredNews.summary}
                      </p>
                      <button 
                        className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors shadow-md text-sm font-medium cursor-pointer"
                        onClick={() => toggleDescription(featuredNews.id)}
                      >
                        {getButtonText(featuredNews, expandedDescriptions[featuredNews.id])}
                        {getButtonIcon(featuredNews, expandedDescriptions[featuredNews.id])}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Stories - Improved responsive grid */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 border-b pb-2">Top Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {topStories.map(news => (
              <div key={news.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="h-48 sm:h-52 relative flex-shrink-0">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://source.unsplash.com/random/400x200/?sports,${news.subcategory}`;
                    }}
                  />
                  <div className="absolute top-0 right-0 m-3">
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                      {news.subcategory}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-gray-500 text-xs mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{news.date}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800 line-clamp-2 flex-shrink-0">{news.title}</h3>
                  {news.summary && (
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="mb-4">
                        <p className={`text-gray-600 text-sm leading-relaxed ${
                          expandedDescriptions[news.id] ? '' : 'line-clamp-3'
                        }`}>
                          {countWords(news.summary) > 50 
                            ? (expandedDescriptions[news.id] ? news.summary : truncateText(news.summary, 30))
                            : news.summary
                          }
                        </p>
                      </div>
                      <button 
                        className="text-red-600 font-medium flex items-center hover:text-red-800 transition-colors self-start cursor-pointer"
                        onClick={() => toggleDescription(news.id)}
                      >
                        {getButtonText(news, expandedDescriptions[news.id])}
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${countWords(news.summary) > 50 ? '' : `transition-transform ${expandedDescriptions[news.id] ? 'rotate-180' : ''}`}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {countWords(news.summary) > 50 ? <path d="M5 12h14M12 5l7 7-7 7"></path> : <polyline points="6 9 12 15 18 9"></polyline>}
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest News - Improved responsive grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 border-b pb-2">Latest Updates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {latestNews.map(news => (
              <div key={news.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="h-40 sm:h-44 relative flex-shrink-0">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://source.unsplash.com/random/300x200/?sports,${news.subcategory}`;
                    }}
                  />
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                  <div className="flex items-center text-gray-500 text-xs mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{news.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm sm:text-base flex-shrink-0">{news.title}</h3>
                  {news.summary && (
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="mb-2">
                        <p className={`text-gray-600 text-xs sm:text-sm leading-relaxed ${
                          expandedDescriptions[news.id] ? '' : 'line-clamp-2'
                        }`}>
                          {countWords(news.summary) > 50 
                            ? (expandedDescriptions[news.id] ? news.summary : truncateText(news.summary, 20))
                            : news.summary
                          }
                        </p>
                      </div>
                      <button 
                        className="text-red-600 text-xs sm:text-sm font-medium flex items-center hover:text-red-800 transition-colors self-start mt-auto cursor-pointer"
                        onClick={() => toggleDescription(news.id)}
                      >
                        {getButtonText(news, expandedDescriptions[news.id])}
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ml-1 ${countWords(news.summary) > 50 ? '' : `transition-transform ${expandedDescriptions[news.id] ? 'rotate-180' : ''}`}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {countWords(news.summary) > 50 ? <path d="M5 12h14M12 5l7 7-7 7"></path> : <polyline points="6 9 12 15 18 9"></polyline>}
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          <div className="flex justify-center mt-8 sm:mt-10">
            <button 
              onClick={loadMoreNews}
              className={`bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-colors shadow-md flex items-center font-medium text-sm sm:text-base ${!hasMoreNews ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={!hasMoreNews}
            >
              <span>{hasMoreNews ? 'Load More News' : 'No More News Available'}</span>
              {hasMoreNews && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out forwards;
        }

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
        
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SportsPage;
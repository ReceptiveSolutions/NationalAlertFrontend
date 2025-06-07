import React, { useState } from 'react';
import { FiTrendingUp, FiChevronDown, FiChevronUp, FiExternalLink, FiTarget, FiAward, FiRefreshCw } from 'react-icons/fi';

// Mock IndianSportsNewsFetcher component
const IndianSportsNewsFetcher = ({ onDataLoaded }) => {
  React.useEffect(() => {
    // Simulate fetching data with a delay
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock sports news data
      const mockData = [
        {
          id: 1,
          title: "India Wins Historic Test Series Against Australia",
          summary: "In a thrilling conclusion to the Border-Gavaskar Trophy, Team India secured a remarkable 3-1 victory against Australia on their home soil. The series was marked by outstanding performances from young Indian bowlers and batsmen who showed exceptional temperament under pressure. This victory marks India's second consecutive series win in Australia, cementing their position as one of the world's top cricket teams. The final Test at the Gabba saw India chase down a challenging target of 328 runs with Rishabh Pant playing a match-winning knock of 89 not out.",
          image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=500&fit=crop",
          date: "2 hours ago",
          author: "Sports Desk",
          source: "ESPN Cricinfo",
          category: "Cricket",
          isCricket: true,
          isBreaking: true,
          link: "https://example.com/cricket-news-1"
        },
        {
          id: 2,
          title: "Indian Football Team Qualifies for AFC Asian Cup Semifinals",
          summary: "The Indian national football team created history by defeating South Korea 2-1 in the quarterfinals of the AFC Asian Cup. Goals from Sunil Chhetri and Manvir Singh sealed the victory in extra time. This is India's first semifinal appearance in the tournament since 1964. The Blue Tigers will now face Japan in the semifinals on Tuesday. Coach Igor Stimac praised the team's fighting spirit and tactical discipline throughout the match.",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop",
          date: "4 hours ago",
          author: "Football Reporter",
          source: "Goal.com",
          category: "Football",
          isFootball: true,
          isBreaking: true,
          link: "https://example.com/football-news-1"
        },
        {
          id: 3,
          title: "PV Sindhu Advances to BWF World Championships Final",
          summary: "Olympic medalist PV Sindhu defeated Carolina Marin 21-18, 21-16 in the semifinals to reach her third World Championships final. Sindhu dominated the match with her powerful smashes and court coverage. She will face defending champion Akane Yamaguchi of Japan in the final on Sunday.",
          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop",
          date: "6 hours ago",
          author: "Badminton Correspondent",
          source: "BWF Official",
          category: "Badminton",
          link: "https://example.com/badminton-news-1"
        },
        {
          id: 4,
          title: "Indian Hockey Team Wins Bronze at Commonwealth Games",
          summary: "The Indian men's hockey team secured a bronze medal at the Commonwealth Games after defeating New Zealand 3-2 in a thrilling playoff match. Harmanpreet Singh scored twice while Mandeep Singh added the third goal. This marks India's return to the Commonwealth Games hockey podium after 16 years.",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
          date: "8 hours ago",
          author: "Hockey Writer",
          source: "Hockey India",
          category: "Hockey",
          isHockey: true,
          link: "https://example.com/hockey-news-1"
        },
        {
          id: 5,
          title: "Neeraj Chopra Breaks National Record at Diamond League",
          summary: "Olympic champion Neeraj Chopra threw a massive 89.94m to break his own national record at the Diamond League meeting in Eugene. The throw also secured him the top position in the world rankings for this season. Chopra expressed satisfaction with his performance and aims for the 90m mark in upcoming competitions.",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop",
          date: "12 hours ago",
          author: "Athletics Reporter",
          source: "World Athletics",
          category: "Athletics",
          link: "https://example.com/athletics-news-1"
        },
        {
          id: 6,
          title: "Virat Kohli Announces Return to T20 Cricket",
          summary: "Former Indian captain Virat Kohli has announced his return to T20 international cricket ahead of the upcoming World Cup. Kohli had taken a break from the shortest format but feels refreshed and ready to contribute to the team's success.",
          image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=500&fit=crop",
          date: "1 day ago",
          author: "Cricket Insider",
          source: "BCCI",
          category: "Cricket",
          isCricket: true,
          link: "https://example.com/cricket-news-2"
        },
        {
          id: 7,
          title: "ISL Final: Mumbai City FC Defeats Kerala Blasters 2-0",
          summary: "Mumbai City FC clinched their second ISL title with a commanding 2-0 victory over Kerala Blasters in the final at the Jawaharlal Nehru Stadium. Goals from Ahmed Jahouh and Bipin Singh sealed the victory for the Islanders in front of a packed crowd.",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop",
          date: "1 day ago",
          author: "ISL Reporter",
          source: "ISL Official",
          category: "Football",
          isFootball: true,
          link: "https://example.com/football-news-2"
        },
        {
          id: 8,
          title: "Kidambi Srikanth Wins Indonesia Open Title",
          summary: "Kidambi Srikanth defeated world number 3 Anders Antonsen of Denmark 21-15, 21-18 to win the Indonesia Open Super 1000 title. This is Srikanth's first title of the season and marks his return to top form after a series of early exits in recent tournaments.",
          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=500&fit=crop",
          date: "2 days ago",
          author: "Badminton Expert",
          source: "BWF",
          category: "Badminton",
          link: "https://example.com/badminton-news-2"
        }
      ];
      
      onDataLoaded(mockData);
    };
    
    fetchData();
  }, [onDataLoaded]);
  
  return null;
};

const IndianSportsHomepage = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [cricketNews, setCricketNews] = useState([]);
  const [footballNews, setFootballNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState(null);
  
  // Separate state objects for different sections
  const [expandedFeaturedArticles, setExpandedFeaturedArticles] = useState({});
  const [expandedTrendingArticles, setExpandedTrendingArticles] = useState({});
  const [expandedLatestArticles, setExpandedLatestArticles] = useState({});
  
  const [displayCount, setDisplayCount] = useState(6);

  // Sport categories for filtering
  const categories = [
    { id: 'all', name: 'All Sports', icon: '🏆' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'hockey', name: 'Hockey', icon: '🏑' },
    { id: 'badminton', name: 'Badminton', icon: '🏸' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' }
  ];

  // Helper function to check if article has more than 50 words
  const hasMoreThan50Words = (summary) => {
    const wordCount = summary ? summary.split(/\s+/).length : 0;
    return wordCount > 50;
  };

  // Filter news by category
  const getFilteredNews = () => {
    if (activeCategory === 'all') return latestNews;
    
    return latestNews.filter(article => {
      switch (activeCategory) {
        case 'cricket':
          return article.isCricket || article.category?.toLowerCase() === 'cricket';
        case 'football':
          return article.isFootball || article.category?.toLowerCase() === 'football';
        case 'hockey':
          return article.isHockey || article.category?.toLowerCase() === 'hockey';
        case 'badminton':
          return article.category?.toLowerCase() === 'badminton';
        case 'tennis':
          return article.category?.toLowerCase() === 'tennis';
        default:
          return article.category?.toLowerCase() === activeCategory;
      }
    });
  };

  // Toggle functions for different sections
  const toggleExpandFeatured = (article) => {
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50 && article.link) {
      window.open(article.link, '_blank');
    } else {
      setExpandedFeaturedArticles(prev => ({
        ...prev,
        [article.id]: !prev[article.id]
      }));
    }
  };

  const toggleExpandTrending = (article) => {
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50 && article.link) {
      window.open(article.link, '_blank');
    } else {
      setExpandedTrendingArticles(prev => ({
        ...prev,
        [article.id]: !prev[article.id]
      }));
    }
  };

  const toggleExpandLatest = (article) => {
    const wordCount = article.summary ? article.summary.split(/\s+/).length : 0;
    
    if (wordCount > 50 && article.link) {
      window.open(article.link, '_blank');
    } else {
      setExpandedLatestArticles(prev => ({
        ...prev,
        [article.id]: !prev[article.id]
      }));
    }
  };

  const loadMoreArticles = () => {
    setDisplayCount(prevCount => prevCount + 6);
  };

  // Handle data from RSS fetcher
  const handleDataLoaded = (sportsData) => {
    try {
      if (!sportsData || sportsData.length === 0) {
        throw new Error('No Indian sports news data available');
      }

      // Distribute articles across different sections
      setFeaturedNews(sportsData.slice(0, 6));
      setLatestNews(sportsData);
      
      // Create trending from breaking/important news
      const trending = sportsData
        .filter(item => item.isBreaking || item.isCricket || item.isFootball)
        .slice(0, 5)
        .map((item, idx) => ({
          ...item,
          trend: idx % 2 === 0 ? 'up' : 'down'
        }));
      
      setTrendingNews(trending);
      
      // Separate cricket and football news
      setCricketNews(sportsData.filter(item => item.isCricket).slice(0, 8));
      setFootballNews(sportsData.filter(item => item.isFootball).slice(0, 8));
      
      setError(null);
    } catch (err) {
      console.error('Error processing Indian sports data:', err);
      setError('Unable to load Indian sports news. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="bg-gradient-to-br from-orange-50 to-green-50 min-h-screen">
      <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-10 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 animate-pulse">
            <div className="h-4 bg-white bg-opacity-30 w-40 mb-2 rounded"></div>
            <div className="h-8 bg-white bg-opacity-30 w-3/4 mb-3 rounded"></div>
            <div className="h-4 bg-white bg-opacity-30 w-1/2 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className={`bg-white shadow-md rounded-lg overflow-hidden ${index < 2 ? 'lg:col-span-2' : ''}`}
              >
                <div className="relative animate-pulse">
                  <div className={`w-full ${index < 2 ? 'h-72' : 'h-40'} bg-gray-300`}></div>
                </div>
                <div className="p-4">
                  <div className="h-5 bg-gray-300 w-3/4 mb-2 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 w-full mb-1 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 w-2/3 mb-3 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Error display
  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-green-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-orange-600 mb-4">
          <FiTarget className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Unable to Load Sports News</h2>
        <p className="text-gray-600 mb-6">We're having trouble fetching the latest Indian sports news. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-medium py-2 px-6 rounded transition duration-300 flex items-center justify-center mx-auto"
        >
          <FiRefreshCw className="mr-2" />
          Refresh Page
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-orange-50 to-green-50 min-h-screen">
      <IndianSportsNewsFetcher onDataLoaded={handleDataLoaded} />

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorDisplay />
      ) : (
        <div>
          {/* Hero Section */}
          <section className="relative">
            <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-10 px-6 lg:px-10">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <FiAward className="mr-2" />
                    <span className="text-sm font-medium">🇮🇳 INDIAN SPORTS LIVE</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                    Latest Indian Sports News
                  </h1>
                  <p className="text-base md:text-lg opacity-90 max-w-3xl">
                    Stay updated with cricket, football, hockey, and all Indian sports action
                  </p>
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        activeCategory === category.id
                          ? 'bg-white text-orange-600 shadow-md'
                          : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
                
                {/* Featured Sports News */}
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
                            e.target.src = `https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=500&fit=crop&t=${index}`;
                          }}
                        />
                        {article.isBreaking && (
                          <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 text-xs font-bold">
                            🔴 LIVE
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                          {article.source}
                        </div>
                      </div>

                      <div className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-500">{article.date}</span>
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                            {article.category}
                          </span>
                        </div>
                        
                        <h2 className="text-sm sm:text-base lg:text-lg font-bold mb-2 text-gray-800">
                          {article.title}
                        </h2>
                        <div className="text-xs sm:text-sm text-gray-600 mb-3">
                          {expandedFeaturedArticles[article.id] ? (
                            <p>{article.summary}</p>
                          ) : (
                            <p className="line-clamp-2">{article.summary}</p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{article.author}</span>
                          <button 
                            onClick={() => toggleExpandFeatured(article)}
                            className="text-orange-600 hover:text-orange-500 text-xs font-medium flex items-center"
                          >
                            {hasMoreThan50Words(article.summary) ? (
                              <>Read Full <FiExternalLink className="ml-1" size={12} /></>
                            ) : expandedFeaturedArticles[article.id] ? (
                              <>Less <FiChevronUp className="ml-1" size={12} /></>
                            ) : (
                              <>More <FiChevronDown className="ml-1" size={12} /></>
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
              
              {/* Sidebar - Trending Sports */}
              <div className="order-2 lg:order-1 space-y-6 lg:space-y-8">
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <FiTrendingUp className="text-orange-600 mr-2" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Trending Now</h2>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {trendingNews.map((article, index) => (
                      <div key={article.id} className="flex items-start pb-3 sm:pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <span className="text-lg sm:text-2xl font-bold text-orange-300 mr-2 sm:mr-3 flex-shrink-0">#{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 cursor-pointer line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="text-xs sm:text-sm text-gray-600 mb-2">
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs mr-2">
                              {article.category}
                            </span>
                            <span className="text-gray-500">{article.source}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {expandedTrendingArticles[article.id] ? (
                              <p>{article.summary}</p>
                            ) : (
                              <p className="line-clamp-2">{article.summary.substring(0, 80)}...</p>
                            )}
                          </div>
                          <button 
                            onClick={() => toggleExpandTrending(article)}
                            className="text-orange-600 hover:text-orange-500 text-xs font-medium flex items-center mt-2"
                          >
                            {hasMoreThan50Words(article.summary) ? (
                              <>Read Full <FiExternalLink className="ml-1" size={12} /></>
                            ) : expandedTrendingArticles[article.id] ? (
                              <>Less <FiChevronUp className="ml-1" size={12} /></>
                            ) : (
                              <>More <FiChevronDown className="ml-1" size={12} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest Sports News */}
              <div className="order-1 lg:order-2 lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {activeCategory === 'all' ? 'All Sports News' : `${categories.find(c => c.id === activeCategory)?.name} News`}
                  </h2>
                  <p className="text-gray-600">Latest updates from Indian sports</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {getFilteredNews().slice(0, displayCount).map(article => (
                    <div key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 w-full sm:w-32 md:w-48 h-48 sm:h-32 md:h-auto overflow-hidden">
                          <img 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                            src={article.image} 
                            alt={`${article.title}`}
                            onError={(e) => {
                              e.target.src = `https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300&h=200&fit=crop&t=${article.category}`;
                            }}
                          />
                        </div>
                        <div className="p-4 sm:p-4 md:p-6 flex-1 min-w-0">
                          <div className="mb-2 flex justify-between items-center flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{article.date}</span>
                              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                {article.category}
                              </span>
                            </div>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                              {article.source}
                            </span>
                          </div>
                          
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 cursor-pointer transition-colors duration-200 line-clamp-2">
                            {article.title}
                          </h3>
                          
                          <div className="text-sm sm:text-base text-gray-600 mb-4 overflow-hidden transition-all duration-300" 
                               style={{maxHeight: expandedLatestArticles[article.id] ? '1000px' : '3rem'}}>
                            <p className={expandedLatestArticles[article.id] ? '' : 'line-clamp-2'}>
                              {article.summary}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => toggleExpandLatest(article)}
                            className="text-orange-600 hover:text-orange-500 text-sm font-medium flex items-center transition-colors duration-200"
                          >
                            {hasMoreThan50Words(article.summary) ? (
                              <>Read Full Story <FiExternalLink className="ml-1" size={14} /></>
                            ) : expandedLatestArticles[article.id] ? (
                              <>Show Less <FiChevronUp className="ml-1" size={14} /></>
                            ) : (
                              <>Read More <FiChevronDown className="ml-1" size={14} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {getFilteredNews().length > displayCount && (
                    <div className="flex justify-center mt-6 sm:mt-8">
                      <button 
                        onClick={loadMoreArticles}
                        className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm sm:text-base"
                      >
                        Load More Sports News
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          
        </div>
      )}
    </div>
  );
};

export default IndianSportsHomepage;
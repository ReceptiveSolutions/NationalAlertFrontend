import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const Sslider = ({ onArticleStore }) => {
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const progressRef = useRef(null);
  const sliderContainerRef = useRef(null);
  
  const [sliderArticles, setSliderArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getFallbackImage = (index) => {
    const categories = ['football', 'basketball', 'soccer', 'tennis', 'cricket', 'baseball'];
    return `https://source.unsplash.com/800x600/?${categories[index % categories.length]}`;
  };

  const fetchSliderData = async (attempt = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/api/news/category/last24h?category=sports`);
      
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
        const sportsCategories = ['Football', 'Basketball', 'Soccer', 'Tennis', 'Cricket', 'Baseball', 'Hockey', 'Golf'];
        
        const processedArticles = articles.map((item, index) => {
          let subcategory = 'Football';
          const content = (item.title + ' ' + (item.description || item.summary || '')).toLowerCase();
          
          if (content.includes('basketball') || content.includes('nba') || content.includes('ncaa basketball')) {
            subcategory = 'Basketball';
          } else if (content.includes('soccer') || content.includes('fifa') || content.includes('premier league') || content.includes('world cup')) {
            subcategory = 'Soccer';
          } else if (content.includes('tennis') || content.includes('wimbledon') || content.includes('us open tennis')) {
            subcategory = 'Tennis';
          } else if (content.includes('cricket') || content.includes('ipl') || content.includes('world cup cricket')) {
            subcategory = 'Cricket';
          } else if (content.includes('baseball') || content.includes('mlb') || content.includes('world series')) {
            subcategory = 'Baseball';
          } else if (content.includes('hockey') || content.includes('nhl') || content.includes('stanley cup')) {
            subcategory = 'Hockey';
          } else if (content.includes('golf') || content.includes('pga') || content.includes('masters')) {
            subcategory = 'Golf';
          }
          
          const isWin = Math.random() > 0.5;
          const score = `${Math.floor(Math.random() * 50) + 10}-${Math.floor(Math.random() * 50) + 10}`;
          const matchResult = isWin ? 'WIN' : 'LOSS';
          
          return {
            id: item.article_id || item.id || `slider_${index}`,
            title: item.title || 'Latest Sports Update',
            description: item.description || item.summary || item.content || 'Click to read more about this sports update',
            image_url: item.image_url || item.image || item.urlToImage || getFallbackImage(index),
            image: item.image_url || item.image || item.urlToImage || getFallbackImage(index),
            date: item.pubDate || item.publishedAt || item.date ? 
              new Date(item.pubDate || item.publishedAt || item.date).toLocaleDateString() : 
              new Date().toLocaleDateString(),
            author: item.author || 'Sports Reporter',
            category: item.category || 'Sports',
            subcategory: subcategory,
            readTime: `${Math.max(1, Math.floor((item.description?.length || 0) / 200))} min read`,
            isHot: isWin,
            matchScore: score,
            matchResult: matchResult,
            teamStats: `${Math.floor(Math.random() * 100) + 50}%`,
            content: [{
              subheading: 'Sports News',
              text: item.description || item.summary || item.content || 'Full article content would be displayed here.',
            }],
            isRssData: false,
            timestamp: Date.now(),
            cycle: new Date().toLocaleString(),
          };
        });

        // Duplicate articles for infinite effect if we have fewer articles
        let infiniteArticles = [...processedArticles];
        if (processedArticles.length < 10) {
          infiniteArticles = [...processedArticles, ...processedArticles, ...processedArticles];
        }

        setSliderArticles(infiniteArticles);
        setRetryCount(0);
      } else {
        throw new Error('No articles found in processed data');
      }
    } catch (error) {
      console.error(`Failed to fetch data (attempt ${attempt + 1}):`, error);
      
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000;
        setRetryCount(attempt + 1);
        
        setTimeout(() => {
          fetchSliderData(attempt + 1);
        }, delay);
      } else {
        setError('Failed to load sports news. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliderData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSliderData();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (article) => {
    const completeArticle = {
      ...article,
      id: article.id,
      title: article.title || 'Sports Update',
      summary: article.description || article.summary || 'Click to read the full article',
      image: article.image_url || article.image || getFallbackImage(0),
      date: article.date || new Date().toLocaleDateString(),
      author: article.author || 'Sports Reporter',
      category: article.category || 'Sports',
      subcategory: article.subcategory || 'News',
      readTime: article.readTime || '3 min read',
      isBreaking: article.isHot || false,
      content: article.content || [{
        subheading: 'Sports News',
        text: article.description || article.summary || 'Full article content would be displayed here.',
      }],
      isRssData: article.isRssData || false,
    };

    if (onArticleStore) {
      onArticleStore(completeArticle);
    }

    navigate(`/article/${article.id}`);
  };

  const handleAutoplayTimeLeft = (s, time, progress) => {
    if (progressRef.current) {
      progressRef.current.style.setProperty('--progress', (1 - progress).toString());
    }
  };

  // Handle hover state for autoplay pause
  useEffect(() => {
    const slider = sliderContainerRef.current;
    if (!slider) return;

    const handleMouseEnter = () => {
      setIsHovered(true);
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.autoplay.stop();
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.autoplay.start();
      }
    };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (isLoading && sliderArticles.length === 0) {
    return (
      <div className="w-full py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Loading Sports News...
              </h2>
            </div>
          </div>
          <div className="flex justify-center items-center h-40">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && sliderArticles.length === 0) {
    return (
      <div className="w-full py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="text-red-500 mb-4">
              <svg className="w-16 sm:w-20 h-16 sm:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Failed to Load Sports News</h3>
            <p className="text-red-600 mb-6 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sliderArticles.length) {
    return (
      <div className="w-full py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-lg mb-4">No articles available in slider</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 sm:py-12 bg-white min-h-screen overflow-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0 max-w-7xl mx-auto">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 via-gray-800 to-red-500 bg-clip-text text-transparent leading-tight">
              🏆 Trending Sports News
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">
              ⚽ Stay updated with the latest scores, highlights, and sports analysis
            </p>
          </div>
          <div className="flex space-x-2 sm:space-x-3">
            <button 
              className="slider-button-prev w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-200 hover:shadow-xl transition-all transform hover:scale-105"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="slider-button-next w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-200 hover:shadow-xl transition-all transform hover:scale-105"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1 sm:h-2 w-full bg-white/20 mb-6 sm:mb-8 overflow-hidden rounded-full shadow-inner max-w-7xl mx-auto">
          <div 
            ref={progressRef}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-white to-red-400 w-full origin-left rounded-full transition-transform duration-150 ease-linear"
            style={{ transform: 'scaleX(var(--progress, 0))' }}
          ></div>
        </div>

        <div ref={sliderContainerRef} className="-mx-4 sm:-mx-6 lg:-mx-8">
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, Navigation, Mousewheel, FreeMode]}
            spaceBetween={16}
            slidesPerView="auto"
            freeMode={{
              enabled: true,
              sticky: false,
              momentumRatio: 0.25,
              momentumVelocityRatio: 0.25,
            }}
            speed={800}
            autoplay={{ 
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            loopAdditionalSlides={3}
            navigation={{
              prevEl: '.slider-button-prev',
              nextEl: '.slider-button-next',
            }}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
            }}
            onAutoplayTimeLeft={handleAutoplayTimeLeft}
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.activeIndex);
            }}
            grabCursor={true}
            className="news-slider !overflow-visible"
            breakpoints={{
              320: {
                slidesPerView: 1.2,
                spaceBetween: 12,
              },
              480: {
                slidesPerView: 1.5,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2.2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2.8,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3.5,
                spaceBetween: 28,
              },
              1280: {
                slidesPerView: 4.2,
                spaceBetween: 32,
              },
              1536: {
                slidesPerView: 5,
                spaceBetween: 36,
              },
            }}
          >
            {sliderArticles.map((article, index) => (
              <SwiperSlide key={`${article.id}-${index}`} className="!w-auto !h-auto">
                <div
                  onClick={() => handleClick(article)}
                  className="group relative rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-[1.02] bg-white border border-gray-200 w-80 h-96"
                >
                  {/* Image Container */}
                  <div className="absolute inset-0">
                    <img
                      src={article.image_url || article.image || getFallbackImage(index)}
                      alt={article.title || 'Sports news'}
                      onError={(e) => (e.target.src = getFallbackImage(index))}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full text-white bg-red-500 shadow-lg">
                      <span className="w-2 h-2 bg-red-200 rounded-full mr-2"></span>
                      {article.subcategory || 'Sports'}
                    </span>
                  </div>

                  {/* Content Container */}
                  <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {article.date}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                      {article.title || 'Latest Sports Update'}
                    </h3>
                    
                    <p className="text-gray-200 line-clamp-3 text-sm leading-relaxed opacity-90">
                      {article.description || article.summary || 'Click to read more about this sports update'}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                      <span className="text-xs text-gray-300 font-medium">
                        By {article.author}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          <div className="text-gray-600 text-sm flex items-center space-x-2">
            <span>Swipe or drag to explore more</span>
          </div>
        </div>
      </div>

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
        .news-slider .swiper-wrapper {
          transition-timing-function: linear;
        }
        .news-slider .swiper-slide {
          transition: all 0.3s ease;
        }
        .news-slider .swiper-slide:hover {
          z-index: 10;
        }
        @media (max-width: 640px) {
          .news-slider .swiper-slide {
            width: 280px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sslider;
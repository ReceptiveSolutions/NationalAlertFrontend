import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const Hslider = ({ onArticleStore }) => {
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

  const getFallbackImage = (index, category) => {
    const crimeCategories = ['sports'];
    const techCategories = ['technology', 'computer', 'smartphone', 'artificial-intelligence', 'cybersecurity'];
    
    if (category === 'crime') {
      return `https://source.unsplash.com/800x600/?${crimeCategories[index % crimeCategories.length]}`;
    } else {
      return `https://source.unsplash.com/800x600/?${techCategories[index % techCategories.length]}`;
    }
  };

  const fetchSliderData = async (attempt = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch from both crime and technology categories
      const [crimeResponse, techResponse, entertainmentResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/news/category/last24h?category=sports`),
        fetch(`${BASE_URL}/api/news/category/last24h?category=entertainment`),
        fetch(`${BASE_URL}/api/news/category/last24h?category=technology`)
      ]);
      
      if (!crimeResponse.ok && !techResponse.ok) {
        throw new Error(`Both API calls failed`);
      }
      
      let allArticles = [];
      
      // Process crime articles
      if (crimeResponse.ok) {
        const crimeData = await crimeResponse.json();
        let crimeArticles = [];
        
        if (Array.isArray(crimeData)) {
          crimeArticles = crimeData;
        } else if (crimeData.data && Array.isArray(crimeData.data)) {
          crimeArticles = crimeData.data;
        } else if (crimeData.articles && Array.isArray(crimeData.articles)) {
          crimeArticles = crimeData.articles;
        } else {
          const keys = Object.keys(crimeData);
          const arrayKey = keys.find(key => Array.isArray(crimeData[key]));
          if (arrayKey) {
            crimeArticles = crimeData[arrayKey];
          }
        }
        
        allArticles = [...allArticles, ...crimeArticles.map(article => ({ ...article, sourceCategory: 'sports' }))];
      }
      
      // Process technology articles
      if (techResponse.ok) {
        const techData = await techResponse.json();
        let techArticles = [];
        
        if (Array.isArray(techData)) {
          techArticles = techData;
        } else if (techData.data && Array.isArray(techData.data)) {
          techArticles = techData.data;
        } else if (techData.articles && Array.isArray(techData.articles)) {
          techArticles = techData.articles;
        } else {
          const keys = Object.keys(techData);
          const arrayKey = keys.find(key => Array.isArray(techData[key]));
          if (arrayKey) {
            techArticles = techData[arrayKey];
          }
        }
        
        allArticles = [...allArticles, ...techArticles.map(article => ({ ...article, sourceCategory: 'technology' }))];
      }

      if (allArticles.length > 0) {
        // Shuffle articles to mix crime and tech
        allArticles = allArticles.sort(() => Math.random() - 0.5);
        
        const processedArticles = allArticles.map((item, index) => {
          let subcategory = item.sourceCategory === 'crime' ? 'Crime' : 'Technology';
          const content = (item.title + ' ' + (item.description || item.summary || '')).toLowerCase();
          
          if (item.sourceCategory === 'sports') {
            if (content.includes('fraud') || content.includes('scam') || content.includes('financial crime')) {
              subcategory = 'Financial Crime';
            } else if (content.includes('cyber') || content.includes('hacking') || content.includes('data breach')) {
              subcategory = 'Cybercrime';
            } else if (content.includes('murder') || content.includes('homicide') || content.includes('killing')) {
              subcategory = 'Violent Crime';
            } else if (content.includes('theft') || content.includes('robbery') || content.includes('burglary')) {
              subcategory = 'Property Crime';
            } else if (content.includes('drug') || content.includes('narcotics') || content.includes('trafficking')) {
              subcategory = 'Drug Crime';
            } else if (content.includes('arrest') || content.includes('investigation') || content.includes('police')) {
              subcategory = 'Investigation';
            }
          } else {
            if (content.includes('ai') || content.includes('artificial intelligence') || content.includes('machine learning')) {
              subcategory = 'Artificial Intelligence';
            } else if (content.includes('crypto') || content.includes('blockchain') || content.includes('bitcoin')) {
              subcategory = 'Cryptocurrency';
            } else if (content.includes('smartphone') || content.includes('iphone') || content.includes('android')) {
              subcategory = 'Mobile Tech';
            } else if (content.includes('software') || content.includes('app') || content.includes('programming')) {
              subcategory = 'Software';
            } else if (content.includes('security') || content.includes('privacy') || content.includes('cybersecurity')) {
              subcategory = 'Cybersecurity';
            } else if (content.includes('startup') || content.includes('funding') || content.includes('ipo')) {
              subcategory = 'Tech Business';
            }
          }
          
          const isHot = Math.random() > 0.5;
          const severity = item.sourceCategory === 'crime' ? 
            ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)] :
            ['Beta', 'Stable', 'Updated', 'New'][Math.floor(Math.random() * 4)];
          
          return {
            id: item.article_id || item.id || `slider_${index}`,
            title: item.title || (item.sourceCategory === 'crime' ? 'Latest Crime Update' : 'Latest Tech Update'),
            description: item.description || item.summary || item.content || 'Click to read more about this update',
            image_url: item.image_url || item.image || item.urlToImage || getFallbackImage(index, item.sourceCategory),
            image: item.image_url || item.image || item.urlToImage || getFallbackImage(index, item.sourceCategory),
            date: item.pubDate || item.publishedAt || item.date ? 
              new Date(item.pubDate || item.publishedAt || item.date).toLocaleDateString() : 
              new Date().toLocaleDateString(),
            author: item.author || (item.sourceCategory === 'crime' ? 'Crime Reporter' : 'Tech Analyst'),
            category: item.sourceCategory === 'crime' ? 'Crime' : 'Technology',
            subcategory: subcategory,
            readTime: `${Math.max(1, Math.floor((item.description?.length || 0) / 200))} min read`,
            isHot: isHot,
            severity: severity,
            status: item.sourceCategory === 'crime' ? 
              ['Under Investigation', 'Solved', 'Ongoing', 'Closed'][Math.floor(Math.random() * 4)] :
              ['Developing', 'Released', 'Testing', 'Available'][Math.floor(Math.random() * 4)],
            content: [{
              subheading: item.sourceCategory === 'crime' ? 'Crime News' : 'Technology News',
              text: item.description || item.summary || item.content || 'Full article content would be displayed here.',
            }],
            isRssData: false,
            timestamp: Date.now(),
            cycle: new Date().toLocaleString(),
            sourceCategory: item.sourceCategory,
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
        setError('Failed to load news. Please try again later.');
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
      title: article.title || 'News Update',
      summary: article.description || article.summary || 'Click to read the full article',
      image: article.image_url || article.image || getFallbackImage(0, article.sourceCategory),
      date: article.date || new Date().toLocaleDateString(),
      author: article.author || 'News Reporter',
      category: article.category || 'News',
      subcategory: article.subcategory || 'Update',
      readTime: article.readTime || '3 min read',
      isBreaking: article.isHot || false,
      content: article.content || [{
        subheading: 'News Update',
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
                Loading Sports & Tech News...
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Failed to Load News</h3>
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
    <div className="w-full py-8 sm:py-12  min-h-screen overflow-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0 max-w-7xl mx-auto">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 via-gray-800 to-red-500 bg-clip-text text-transparent leading-tight">
              🔍 Sports & Technology News
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">
              💻🚨 Breaking stories from crime investigations and technology innovations
            </p>
          </div>
          <div className="flex space-x-2 sm:space-x-3">
            <button 
              className="slider-button-prev w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-200 hover:shadow-xl transition-all transform hover:scale-105"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="slider-button-next w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-200 hover:shadow-xl transition-all transform hover:scale-105"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      src={article.image_url || article.image || getFallbackImage(index, article.sourceCategory)}
                      alt={article.title || 'News'}
                      onError={(e) => (e.target.src = getFallbackImage(index, article.sourceCategory))}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  
                  {/* Category Badge
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full text-white bg-red-500 shadow-lg">
                      <span className="w-2 h-2 bg-red-200 rounded-full mr-2"></span>
                      {article.subcategory || article.category}
                    </span>
                  </div> */}

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
                    
                    <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors duration-300 leading-tight">
                      {article.title || 'Latest News Update'}
                    </h3>
                    
                    <p className="text-gray-200 line-clamp-3 text-sm leading-relaxed opacity-90">
                      {article.description || article.summary || 'Click to read more about this news update'}
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

export default Hslider;
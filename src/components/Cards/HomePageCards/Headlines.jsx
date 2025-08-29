import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Mousewheel, FreeMode, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

const TopSlider = ({ onArticleStore }) => {
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const sliderContainerRef = useRef(null);

  const [sliderArticles, setSliderArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getFallbackImage = (index) => {
    const categories = ['breaking-news', 'newspaper', 'journalism'];
    return `https://source.unsplash.com/800x600/?${categories[index % categories.length]}`;
  };

  const fetchSliderData = async (attempt = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/api/news?category=top-stories&limit=20`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      let articles = [];

      if (Array.isArray(data)) articles = data;
      else if (data.data) articles = data.data;
      else if (data.articles) articles = data.articles;
      else {
        const key = Object.keys(data).find(k => Array.isArray(data[k]));
        if (key) articles = data[key];
      }

      if (!articles.length) throw new Error("No articles found");

      const processed = articles.map((item, index) => {
        const text = (item.title + ' ' + (item.description || item.summary || '')).toLowerCase();
        let subcategory = 'Breaking News';
        if (text.includes('politics')) subcategory = 'Politics';
        else if (text.includes('business')) subcategory = 'Business';
        else if (text.includes('world')) subcategory = 'World';
        else if (text.includes('health')) subcategory = 'Health';
        else if (text.includes('sports')) subcategory = 'Sports';
        else if (text.includes('entertainment')) subcategory = 'Entertainment';

        return {
          id: item.article_id || item.id || `top_${index}`,
          title: item.title || 'Breaking News Update',
          description: item.description || item.summary || item.content || 'Click to read more',
          image_url: item.image_url || item.image || getFallbackImage(index),
          date: new Date(item.pubDate || item.publishedAt || item.date || Date.now()).toLocaleDateString(),
          author: item.author || 'News Desk',
          category: 'Top Stories',
          subcategory,
          readTime: `${Math.max(1, Math.floor((item.description?.length || 100) / 200))} min read`,
          isBreaking: Math.random() > 0.6,
          priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          status: ['Live', 'Updated', 'Developing'][Math.floor(Math.random() * 3)],
          content: [{
            subheading: 'Top Story',
            text: item.description || item.summary || item.content,
          }],
          isRssData: false,
          timestamp: Date.now(),
          cycle: new Date().toLocaleString(),
          sourceCategory: 'top-stories',
        };
      });

      setSliderArticles(processed.length < 10 ? [...processed, ...processed] : processed);
      setRetryCount(0);
    } catch (err) {
      if (attempt < 2) {
        setTimeout(() => fetchSliderData(attempt + 1), Math.pow(2, attempt) * 1000);
        setRetryCount(retryCount + 1);
      } else {
        setError("Failed to load top stories.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliderData();
    const interval = setInterval(() => fetchSliderData(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const slider = sliderContainerRef.current;
    if (!slider) return;
    const onEnter = () => {
      setIsHovered(true);
      swiperRef.current?.swiper?.autoplay?.stop();
    };
    const onLeave = () => {
      setIsHovered(false);
      swiperRef.current?.swiper?.autoplay?.start();
    };
    slider.addEventListener('mouseenter', onEnter);
    slider.addEventListener('mouseleave', onLeave);
    return () => {
      slider.removeEventListener('mouseenter', onEnter);
      slider.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const handleClick = (article) => {
    const full = {
      ...article,
      summary: article.description,
      image: article.image_url,
      content: article.content || [{ subheading: 'Top Story', text: article.description }],
    };
    onArticleStore?.(full);
    navigate(`/article/${article.id}`);
  };

  const goToPrev = () => swiperRef.current?.swiper?.slidePrev();
  const goToNext = () => swiperRef.current?.swiper?.slideNext();

  if (isLoading) {
    return (
      <div className="w-full py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex space-x-4 p-6 bg-gray-50 rounded-xl">
                  <div className="w-24 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">Unable to Load Headlines</div>
            <p className="text-red-500 text-sm">{error}</p>
            <button 
              onClick={() => fetchSliderData()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sliderArticles.length) {
    return (
      <div className="w-full py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="text-gray-600 text-lg font-semibold">No Headlines Available</div>
            <p className="text-gray-500 text-sm mt-2">Please check back later for the latest news.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4" ref={sliderContainerRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
           
          </div>
          
          {/* Navigation Controls */}
          <div className="hidden sm:flex items-center space-x-2">
            <button 
              onClick={goToPrev}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group shadow-lg border-gray-200"
              aria-label="Previous headline"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={goToNext}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group shadow-lg border-gray-200"
              aria-label="Next headline"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, Navigation, Mousewheel, FreeMode, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            centeredSlides={false}
            speed={600}
            loop={true}
            autoplay={{
              delay: isMobile ? 4000 : 6000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            className="top-headlines-slider"
          >
            {sliderArticles.map((article, index) => (
              <SwiperSlide key={`${article.id}-${index}`}>
                <article
                  onClick={() => handleClick(article)}
                  className="group cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden h-full"
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = getFallbackImage(index);
                      }}
                    />
                    {/* Overlay badges */}
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      {article.isBreaking && (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                          BREAKING
                        </span>
                      )}
                      <span className="px-2 py-1 bg-black/80 text-white text-xs font-medium rounded-full">
                        {article.subcategory}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-3 leading-tight">
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {article.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">{article.author}</span>
                        <span>•</span>
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{article.readTime}</span>
                        <svg className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Mobile Pagination Dots */}
          <div className="flex justify-center mt-6 sm:hidden space-x-2">
            {sliderArticles.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => swiperRef.current?.swiper?.slideTo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex % 5 ? 'bg-red-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Status Bar */}
        
      </div>
    </section>
  );
};

export default TopSlider;
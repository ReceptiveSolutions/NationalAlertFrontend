import React, { useEffect, useState } from 'react';

const EntertainmentApi = ({ onDataLoaded }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Generate fallback data if API fails
  const generateFallbackData = () => {
    const entertainmentCategories = ['Movies', 'TV Shows', 'Celebrities', 'Awards', 'Streaming', 'Music'];
    const fallbackData = [];
    
    for (let i = 0; i < 15; i++) {
      const category = entertainmentCategories[i % entertainmentCategories.length];
      fallbackData.push({
        id: i,
        title: `${category} News: This is a placeholder headline for ${category} news story ${i+1}`,
        summary: `This is placeholder content for an entertainment article that couldn't be loaded from the API. This would normally contain a summary of the latest ${category.toLowerCase()} news.`,
        image: `https://source.unsplash.com/random/800x500/?${category.toLowerCase()},entertainment`,
        date: new Date().toLocaleDateString(),
        category: 'Entertainment',
        subcategory: category
      });
    }
    
    return fallbackData;
  };
  
  // Check local storage for cached data
  const getCachedData = () => {
    const cachedDataStr = localStorage.getItem('entertainmentNewsData');
    const cachedTimestamp = localStorage.getItem('entertainmentNewsDataTimestamp');
    
    if (cachedDataStr && cachedTimestamp) {
      // Check if cache is still valid (less than 15 minutes old)
      const now = new Date().getTime();
      if (now - parseInt(cachedTimestamp) < 15 * 60 * 1000) {
        try {
          return JSON.parse(cachedDataStr);
        } catch (e) {
          console.error('❌ Failed to parse cached entertainment news data:', e);
        }
      }
    }
    return null;
  };
   
  // Save data to cache
  const cacheData = (data) => {
    try {
      localStorage.setItem('entertainmentNewsData', JSON.stringify(data));
      localStorage.setItem('entertainmentNewsDataTimestamp', new Date().getTime().toString());
    } catch (e) {
      console.error('❌ Failed to cache entertainment news data:', e);
    }
  }; 

  const fetchEntertainmentNews = async (retryCount = 0) => {
    try {
      // First check if we have valid cached data
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('✅ Using cached entertainment news data');
        onDataLoaded(cachedData);
        return;
      }
      
      setIsRetrying(retryCount > 0);
      
      // Fetch from your backend API
//       const response = await fetch(
//   `${import.meta.env.VITE_API_BASE_URL}/api/news/entertainment`
// );
            
       const response = await fetch('https://nationalalertbackend.onrender.com/api/news/entertainment');

      
      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Entertainment Backend Response:', data);

      // Handle both cached and fresh responses from backend
      const articles = data.data || [];
      
      if (Array.isArray(articles) && articles.length > 0) {
        const filteredArticles = articles.map((item, index) => ({
          id: item.article_id || index,
          title: item.title || 'No title available',
          summary: item.description || 'No description available',
          image: item.image_url || `https://source.unsplash.com/random/800x500/?entertainment,movie`,
          date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : new Date().toLocaleDateString(),
          category: 'Entertainment',
          subcategory: item.keywords ? item.keywords[0] : 'Film & TV'
        }));
        
        // Cache the successful response
        cacheData(filteredArticles);
        onDataLoaded(filteredArticles);
        setIsRetrying(false);
      } else {
        throw new Error('No entertainment results found in the API response');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch entertainment news (attempt ${retryCount + 1}):`, error);
      
      // Retry logic - up to 2 retries with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`⏱️ Retrying in ${delay/1000} seconds...`);
        
        setTimeout(() => {
          fetchEntertainmentNews(retryCount + 1);
        }, delay);
      } else {
        // After all retries failed, check for old cache as last resort
        const oldCache = localStorage.getItem('entertainmentNewsData');
        if (oldCache) {
          try {
            console.log('⚠️ Using expired cache as fallback');
            onDataLoaded(JSON.parse(oldCache));
          } catch (e) {
            console.error('❌ Failed to parse expired cache:', e);
            onDataLoaded(generateFallbackData());
          }
        } else {
          // Generate placeholder data as final fallback
          console.log('⚠️ Using generated placeholder data');
          onDataLoaded(generateFallbackData());
        }
        setIsRetrying(false);
      }
    }
  };

  useEffect(() => {
    fetchEntertainmentNews();
    
    // Clean up function
    return () => {
      setIsRetrying(false);
    };
  }, []); // No dependencies since entertainment is static

  // Show a minimal loading indicator if we're retrying
  return isRetrying ? (
    <div className="fixed bottom-4 right-4 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm flex items-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Reconnecting to entertainment news service...
    </div>
  ) : null;
};

export default EntertainmentApi;
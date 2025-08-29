import React, { useEffect, useState } from 'react';

const ShareMarketApi = ({ onDataLoaded }) => {
  const apiKey = import.meta.env.VITE_NEWS1_KEY;
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Generate fallback data if API fails
  const generateFallbackData = () => {
    const marketCategories = ['Stocks', 'Cryptocurrency', 'Commodities', 'Forex', 'IPO', 'Mutual Funds'];
    const stockNames = ['Tesla', 'Apple', 'Amazon', 'Microsoft', 'Google', 'Meta', 'Netflix', 'Nvidia', 'Berkshire Hathaway', 'JPMorgan'];
    const trends = ['+2.3%', '-1.7%', '+0.8%', '-0.5%', '+3.2%', '-2.1%', '+1.5%', '+4.2%', '-0.9%', '+1.1%'];
    const fallbackData = [];
    
    for (let i = 0; i < 15; i++) {
      const category = marketCategories[i % marketCategories.length];
      const stockIndex = i % stockNames.length;
      fallbackData.push({
        id: i,
        title: `${category}: ${stockNames[stockIndex]} ${trends[stockIndex]} - Market Analysis`,
        summary: `This is placeholder content for a stock market article that couldn't be loaded from the API. This would normally contain a summary of the latest ${category.toLowerCase()} trends and analysis for ${stockNames[stockIndex]}.`,
        image: `https://source.unsplash.com/random/800x500/?${category.toLowerCase()},finance`,
        date: new Date().toLocaleDateString(),
        category: 'Business',
        subcategory: category,
        stockPrice: `$${Math.floor(Math.random() * 1000) + 10}.${Math.floor(Math.random() * 99)}`,
        stockChange: trends[stockIndex],
        stockVolume: `${Math.floor(Math.random() * 100) + 1}M`
      });
    }
    
    return fallbackData;
  };
  
  // Check local storage for cached data
  const getCachedData = () => {
    const cachedDataStr = localStorage.getItem('shareMarketData');
    const cachedTimestamp = localStorage.getItem('shareMarketDataTimestamp');
    
    if (cachedDataStr && cachedTimestamp) {
      // Check if cache is still valid (less than 15 minutes old)
      const now = new Date().getTime();
      if (now - parseInt(cachedTimestamp) < 15 * 60 * 1000) {
        try {
          return JSON.parse(cachedDataStr);
        } catch (e) {
          console.error('❌ Failed to parse cached share market data:', e);
        }
      }
    }
    return null;
  };
  
  // Save data to cache
  const cacheData = (data) => {
    try {
      localStorage.setItem('shareMarketData', JSON.stringify(data));
      localStorage.setItem('shareMarketDataTimestamp', new Date().getTime().toString());
    } catch (e) {
      console.error('❌ Failed to cache share market data:', e);
    }
  };

   const fetchShareMarketNews = async (retryCount = 0) => {
    try {
      // First check if we have valid cached data
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('✅ Using cached share market data');
        onDataLoaded(cachedData);
        return;
      }
      
      setIsRetrying(retryCount > 0);
      
      // Call YOUR backend endpoint instead of the News API directly
      const response = await  fetch(`${BASE_URL}/api/news?category=business&limit=50`)


      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend API Response:', data);

      // FIXED: Check if data is directly an array or wrapped in an object
      let articles;
      if (Array.isArray(data)) {
        // Data is directly an array
        articles = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Data is wrapped in an object with 'data' property
        articles = data.data;
      } else if (data.articles && Array.isArray(data.articles)) {
        // Data is wrapped in an object with 'articles' property
        articles = data.articles;
      } else {
        // Try to extract articles from any property that contains an array
        const keys = Object.keys(data);
        const arrayKey = keys.find(key => Array.isArray(data[key]));
        if (arrayKey) {
          articles = data[arrayKey];
        } else {
          throw new Error('No articles found in API response');
        }
      }

      if (Array.isArray(articles) && articles.length > 0) {
        const marketCategories = ['Stocks', 'Cryptocurrency', 'Commodities', 'Forex', 'IPO', 'Mutual Funds'];
        
        // Process the articles
        const filteredArticles = articles.map((item, index) => {
          // Determine the most appropriate subcategory based on content
          let subcategory = 'Stocks';
          const content = (item.title + ' ' + (item.description || item.summary || '')).toLowerCase();
          
          if (content.includes('crypto') || content.includes('bitcoin') || content.includes('ethereum')) {
            subcategory = 'Cryptocurrency';
          } else if (content.includes('gold') || content.includes('oil') || content.includes('commodity')) {
            subcategory = 'Commodities';
          } else if (content.includes('forex') || content.includes('currency') || content.includes('exchange rate')) {
            subcategory = 'Forex';
          } else if (content.includes('ipo')) {
            subcategory = 'IPO';
          } else if (content.includes('mutual fund') || content.includes('etf')) {
            subcategory = 'Mutual Funds';
          }
          
          // Generate some random stock market data
          const isPositive = Math.random() > 0.5;
          const changePercent = (Math.random() * 5).toFixed(2);
          const stockChange = isPositive ? `+${changePercent}%` : `-${changePercent}%`;
          
          return {
            id: item.article_id || item.id || index,
            title: item.title || 'No title available',
            summary: item.description || item.summary || item.content || 'No description available',
            image: item.image_url || item.image || item.urlToImage || `https://source.unsplash.com/random/800x500/?finance,${subcategory.toLowerCase()}`,
            date: item.pubDate || item.publishedAt || item.date ? new Date(item.pubDate || item.publishedAt || item.date).toLocaleDateString() : new Date().toLocaleDateString(),
            category: item.category || 'Business',
            subcategory: subcategory,
            stockPrice: `$${Math.floor(Math.random() * 1000) + 10}.${Math.floor(Math.random() * 99)}`,
            stockChange: stockChange,
            stockVolume: `${Math.floor(Math.random() * 100) + 1}M`
          };
        });
        
        console.log('✅ Processed articles:', filteredArticles.length);
        
        // Cache the successful response
        cacheData(filteredArticles);
        onDataLoaded(filteredArticles);
        setIsRetrying(false);
      } else {
        throw new Error('No articles found in the processed data');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch share market news (attempt ${retryCount + 1}):`, error);
      
      // Retry logic - up to 2 retries with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`⏱️ Retrying in ${delay/1000} seconds...`);
        
        setTimeout(() => {
          fetchShareMarketNews(retryCount + 1);
        }, delay);
      } else {
        // After all retries failed, check for old cache as last resort
        const oldCache = localStorage.getItem('shareMarketData');
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
    fetchShareMarketNews();
    
    // Clean up function
    return () => {
      setIsRetrying(false);
    };
  }, []);

  // Show a minimal loading indicator if we're retrying
  return isRetrying ? (
    <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm flex items-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Reconnecting to market data service...
    </div>
  ) : null;
};

export default ShareMarketApi;
import React, { useEffect, useState } from 'react';

const Newsapi = ({ onDataLoaded, category = 'general' }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Generate fallback data if API fails
  const generateFallbackData = () => {
    const categories = ['Politics', 'Business', 'Technology', 'Health', 'Sports', 'Entertainment'];
    const fallbackData = [];
    
    for (let i = 0; i < 15; i++) {
      const categoryName = categories[i % categories.length];
      fallbackData.push({
        id: i,
        title: `${categoryName} News: This is a placeholder headline for ${categoryName} news story ${i+1}`,
        summary: `This is placeholder content for a news article that couldn't be loaded from the API. This would normally contain a summary of the latest ${categoryName.toLowerCase()} news.`,
        image: `https://source.unsplash.com/random/800x500/?${categoryName.toLowerCase()}`,
        date: new Date().toLocaleDateString(),
        category: categoryName
      });
    }
    
    return fallbackData;
  };
  
  // Check local storage for cached data
  const getCachedData = () => {
    const cachedDataStr = localStorage.getItem(`newsData_${category}`);
    const cachedTimestamp = localStorage.getItem(`newsDataTimestamp_${category}`);
    
    if (cachedDataStr && cachedTimestamp) {
      // Check if cache is still valid (less than 15 minutes old)
      const now = new Date().getTime();
      if (now - parseInt(cachedTimestamp) < 15 * 60 * 1000) {
        try {
          return JSON.parse(cachedDataStr);
        } catch (e) {
          console.error('❌ Failed to parse cached news data:', e);
        }
      }
    }
    return null;
  };
   
  // Save data to cache
  const cacheData = (data) => {
    try {
      localStorage.setItem(`newsData_${category}`, JSON.stringify(data));
      localStorage.setItem(`newsDataTimestamp_${category}`, new Date().getTime().toString());
    } catch (e) {
      console.error('❌ Failed to cache news data:', e);
    }
  }; 

  const fetchNews = async (retryCount = 0) => {
    try {
      // First check if we have valid cached data
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('✅ Using cached news data for', category);
        onDataLoaded(cachedData);
        return;
      }
      
      setIsRetrying(retryCount > 0);
      
      const response = await fetch(`${BASE_URL}/api/news?limit=15`);


      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend Response:', data);

      // Handle different response structures more robustly
      let articles;
      if (Array.isArray(data)) {
        articles = data;
      } else if (data.data && Array.isArray(data.data)) {
        articles = data.data;
      } else if (data.articles && Array.isArray(data.articles)) {
        articles = data.articles;
      } else {
        // Try to extract articles from any array property
        const keys = Object.keys(data);
        const arrayKey = keys.find(key => Array.isArray(data[key]));
        articles = arrayKey ? data[arrayKey] : [];
      }
      
      if (Array.isArray(articles) && articles.length > 0) {
        console.log('🔍 Raw backend articles received:', articles.slice(0, 2)); // Debug log
        
        const filteredArticles = articles.map((item, index) => {
          // ✅ FIXED: Use the correct ID property and don't fallback to index
          const articleId = item.id || item.article_id || item._id; // Try common ID field names
          
          if (!articleId) {
            console.error('❌ Article missing ID:', item);
            return null; // Skip articles without valid IDs
          }
          
          console.log(`🔍 Processing article ${index}:`, { 
            originalId: articleId, 
            title: item.title?.substring(0, 50) 
          });
          
          return {
            id: articleId, // ✅ Use the real UUID from backend
            title: item.title || 'No title available',
            summary: item.description || item.summary || item.content || 'No description available',
            image: item.image_url || item.urlToImage || `https://source.unsplash.com/random/800x500/?${category}`,
            date: item.pubDate || item.publishedAt ? new Date(item.pubDate || item.publishedAt).toLocaleDateString() : new Date().toLocaleDateString(),
            category: item.category || category
          };
        }).filter(Boolean); // Remove null entries (articles without IDs)
        
        console.log('✅ Processed articles with real IDs:', filteredArticles.map(a => ({ id: a.id, title: a.title?.substring(0, 30) })));
        
        // Cache the successful response
        cacheData(filteredArticles);
        onDataLoaded(filteredArticles);
        setIsRetrying(false);
      } else {
        throw new Error('No results found in the API response');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${category} news (attempt ${retryCount + 1}):`, error);
      
      // Retry logic - up to 2 retries with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`⏱️ Retrying in ${delay/1000} seconds...`);
        
        setTimeout(() => {
          fetchNews(retryCount + 1);
        }, delay);
      } else {
        // After all retries failed, check for old cache as last resort
        const oldCache = localStorage.getItem(`newsData_${category}`);
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
    fetchNews();
    
    // Clean up function
    return () => {
      setIsRetrying(false);
    };
  }, [category]); // Re-fetch when category changes

  // Show a minimal loading indicator if we're retrying
  return isRetrying ? (
    <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm flex items-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Reconnecting to news service...
    </div>
  ) : null;
};

export default Newsapi;
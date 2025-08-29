import React, { useEffect, useState } from 'react';

const SportsApi = ({ onDataLoaded }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Generate fallback data if API fails
  const generateFallbackData = () => {
    const sportsCategories = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Formula 1'];
    const fallbackData = [];
    
    for (let i = 0; i < 15; i++) {
      const category = sportsCategories[i % sportsCategories.length];
      fallbackData.push({
        id: i,
        title: `${category} News: This is a placeholder headline for ${category} news story ${i+1}`,
        summary: `This is placeholder content for a sports article that couldn't be loaded from the API. This would normally contain a summary of the latest ${category.toLowerCase()} news.`,
        image: `https://source.unsplash.com/random/800x500/?${category.toLowerCase()},sports`,
        date: new Date().toLocaleDateString(),
        category: 'Sports',
        subcategory: category
      });
    }
    
    return fallbackData;
  };

  const fetchSportsNews = async (retryCount = 0) => {
    try {
      setIsRetrying(retryCount > 0);
      
      // Call backend endpoint for sports news
      const response = await fetch(`${BASE_URL}api/news?category=sports&limit=60`);

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Sports Backend API Response:', data);

      // Handle different response structures from backend
      let articles;
      if (Array.isArray(data)) {
        articles = data;
      } else if (data.data && Array.isArray(data.data)) {
        articles = data.data;
      } else if (data.articles && Array.isArray(data.articles)) {
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
        const sportsCategories = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Golf', 'Formula 1'];
        
        // Process the articles
        const filteredArticles = articles.map((item, index) => {
          // Determine the most appropriate subcategory based on content
          let subcategory = 'General Sports';
          const content = (item.title + ' ' + (item.description || item.summary || '')).toLowerCase();
          
          if (content.includes('football') || content.includes('soccer') || content.includes('nfl')) {
            subcategory = 'Football';
          } else if (content.includes('basketball') || content.includes('nba')) {
            subcategory = 'Basketball';
          } else if (content.includes('cricket')) {
            subcategory = 'Cricket';
          } else if (content.includes('tennis')) {
            subcategory = 'Tennis';
          } else if (content.includes('golf')) {
            subcategory = 'Golf';
          } else if (content.includes('formula') || content.includes('f1') || content.includes('racing')) {
            subcategory = 'Formula 1';
          } else if (item.keywords && item.keywords.length > 0) {
            // Use first keyword as subcategory if available
            const keyword = item.keywords[0];
            const matchedCategory = sportsCategories.find(cat => 
              keyword.toLowerCase().includes(cat.toLowerCase())
            );
            subcategory = matchedCategory || subcategory;
          }
          
          return {
            id: item.article_id || item.id || index,
            title: item.title || 'No title available',
            summary: item.description || item.summary || item.content || 'No description available',
            image: item.image_url || item.image || item.urlToImage || `https://source.unsplash.com/random/800x500/?${subcategory.toLowerCase()},sports`,
            date: item.pubDate || item.publishedAt || item.date ? new Date(item.pubDate || item.publishedAt || item.date).toLocaleDateString() : new Date().toLocaleDateString(),
            category: item.category || 'Sports',
            subcategory: subcategory
          };
        });
        
        console.log('✅ Processed sports articles:', filteredArticles.length);
        
        // Send processed data to parent component (stored in memory only)
        onDataLoaded(filteredArticles);
        setIsRetrying(false);
      } else {
        throw new Error('No articles found in the processed data');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch sports news (attempt ${retryCount + 1}):`, error);
      
      // Retry logic - up to 2 retries with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`⏱️ Retrying in ${delay/1000} seconds...`);
        
        setTimeout(() => {
          fetchSportsNews(retryCount + 1);
        }, delay);
      } else {
        // Generate placeholder data as final fallback
        console.log('⚠️ Using generated placeholder data');
        onDataLoaded(generateFallbackData());
        setIsRetrying(false);
      }
    }
  };

  useEffect(() => {
    fetchSportsNews();
    
    // Clean up function
    return () => {
      setIsRetrying(false);
    };
  }, []);

  // Show a minimal loading indicator if we're retrying
  return isRetrying ? (
    <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm flex items-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Reconnecting to sports news service...
    </div>
  ) : null;
};

export default SportsApi;
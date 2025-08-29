import React, { useEffect, useState } from "react";

const EntertainmentApi = ({ onDataLoaded }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  // Generate fallback data if API fails
  const generateFallbackData = () => {
    const entertainmentCategories = [
      "Movies",
      "TV Shows",
      "Celebrities",
      "Awards",
      "Streaming",
      "Music",
    ];
    const celebrityNames = [
      "Tom Cruise",
      "Jennifer Lawrence",
      "Dwayne Johnson",
      "Zendaya",
      "Robert Downey Jr.",
      "Scarlett Johansson",
      "Chris Hemsworth",
      "Margot Robbie",
      "Leonardo DiCaprio",
      "Emma Stone"
    ];
    const trends = ["Blockbuster", "Controversy", "New Release", "Award Nomination", "Comeback", "Breakup", "New Project", "Interview", "Charity Work", "Fashion Statement"];
    
    const fallbackData = [];

    for (let i = 0; i < 15; i++) {
      const category = entertainmentCategories[i % entertainmentCategories.length];
      const celebIndex = i % celebrityNames.length;
      fallbackData.push({
        id: i,
        title: `${category}: ${celebrityNames[celebIndex]} - ${trends[celebIndex]}`,
        summary: `This is placeholder content for an entertainment article that couldn't be loaded from the API. This would normally contain details about ${celebrityNames[celebIndex]}'s latest ${category.toLowerCase()} ${trends[celebIndex].toLowerCase()}.`,
        image: `https://source.unsplash.com/random/800x500/?${category.toLowerCase()},${celebrityNames[celebIndex].split(' ')[0]}`,
        date: new Date().toLocaleDateString(),
        category: "Entertainment",
        subcategory: category,
        trendingScore: `${Math.floor(Math.random() * 100)}/100`,
        socialMediaMentions: `${Math.floor(Math.random() * 10000) + 1000}`,
        relatedProjects: trends[celebIndex].includes("Project") ? `Project ${Math.floor(Math.random() * 100) + 1}` : "N/A"
      });
    }

    return fallbackData;
  };

  // Check local storage for cached data
  const getCachedData = () => {
    const cachedDataStr = localStorage.getItem("entertainmentData");
    const cachedTimestamp = localStorage.getItem("entertainmentDataTimestamp");

    if (cachedDataStr && cachedTimestamp) {
      // Check if cache is still valid (less than 15 minutes old)
      const now = new Date().getTime();
      if (now - parseInt(cachedTimestamp) < 15 * 60 * 1000) {
        try {
          return JSON.parse(cachedDataStr);
        } catch (e) {
          console.error("❌ Failed to parse cached entertainment data:", e);
        }
      }
    }
    return null;
  };

  // Save data to cache
  const cacheData = (data) => {
    try {
      localStorage.setItem("entertainmentData", JSON.stringify(data));
      localStorage.setItem("entertainmentDataTimestamp", new Date().getTime().toString());
    } catch (e) {
      console.error("❌ Failed to cache entertainment data:", e);
    }
  };

  const fetchEntertainmentNews = async (retryCount = 0) => {
    try {
      // First check if we have valid cached data
      const cachedData = getCachedData();
      if (cachedData) {
        console.log("✅ Using cached entertainment data");
        onDataLoaded(cachedData);
        return;
      }

      setIsRetrying(retryCount > 0);

      // Call backend endpoint
      const response = await fetch(`${BASE_URL}/api/news?category=entertainment&limit=15`);

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Backend API Response:", data);

      // Extract articles from response
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
          throw new Error('No entertainment articles found in API response');
        }
      }

      if (Array.isArray(articles) && articles.length > 0) {
        const entertainmentCategories = ["Movies", "TV Shows", "Celebrities", "Awards", "Streaming", "Music"];
        
        // Process the articles
        const filteredArticles = articles.map((item, index) => {
          // Determine subcategory based on content
          let subcategory = "Movies";
          const content = (item.title + ' ' + (item.description || item.summary || '')).toLowerCase();
          
          if (content.includes('tv') || content.includes('show') || content.includes('series')) {
            subcategory = "TV Shows";
          } else if (content.includes('celebrity') || content.includes('actor') || content.includes('actress')) {
            subcategory = "Celebrities";
          } else if (content.includes('award') || content.includes('oscar') || content.includes('grammy')) {
            subcategory = "Awards";
          } else if (content.includes('stream') || content.includes('netflix') || content.includes('disney+')) {
            subcategory = "Streaming";
          } else if (content.includes('music') || content.includes('song') || content.includes('album')) {
            subcategory = "Music";
          }

          // Generate some entertainment-specific metrics
          const trendingScore = Math.floor(Math.random() * 100);
          const socialMentions = Math.floor(Math.random() * 10000) + 1000;
          
          return {
            id: item.article_id || item.id || index,
            title: item.title || 'No title available',
            summary: item.description || item.summary || item.content || 'No description available',
            image: item.image_url || item.image || item.urlToImage || `https://source.unsplash.com/random/800x500/?entertainment,${subcategory.toLowerCase()}`,
            date: item.pubDate || item.publishedAt || item.date ? new Date(item.pubDate || item.publishedAt || item.date).toLocaleDateString() : new Date().toLocaleDateString(),
            category: item.category || 'Entertainment',
            subcategory: subcategory,
            trendingScore: `${trendingScore}/100`,
            socialMediaMentions: `${socialMentions}`,
            relatedProjects: subcategory === "Movies" || subcategory === "TV Shows" ? `Project ${Math.floor(Math.random() * 100) + 1}` : "N/A"
          };
        });

        console.log('✅ Processed entertainment articles:', filteredArticles.length);
        
        // Cache the successful response
        cacheData(filteredArticles);
        onDataLoaded(filteredArticles);
        setIsRetrying(false);
      } else {
        throw new Error('No entertainment articles found in the processed data');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch entertainment news (attempt ${retryCount + 1}):`, error);
      
      // Retry logic
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`⏱️ Retrying in ${delay/1000} seconds...`);
        
        setTimeout(() => {
          fetchEntertainmentNews(retryCount + 1);
        }, delay);
      } else {
        // After all retries failed, check for old cache as last resort
        const oldCache = localStorage.getItem('entertainmentData');
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
  }, []);

  // Show a minimal loading indicator if we're retrying
  return isRetrying ? (
    <div className="fixed bottom-4 right-4 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm flex items-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Reconnecting to entertainment service...
    </div>
  ) : null;
};

export default EntertainmentApi;
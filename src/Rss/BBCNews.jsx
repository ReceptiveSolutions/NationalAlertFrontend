import React, { useEffect } from 'react';

const BBCNewsFetcher = ({ onDataLoaded }) => {

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const fetchBBCNews = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/news/category/general?source=rss`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json(); // Parse JSON instead of XML
        
        const newsData = data.map((item, index) => ({
          id: item.id || `bbc_${index}_${Date.now()}`,
          title: item.title,
          summary: item.summary || 'No summary available',
          description: item.summary || '',
          image: item.image_url || `https://source.unsplash.com/800x500/?news,bbc,${index}`,
          date: new Date(item.pub_date || item.created_at).toLocaleDateString(),
          link: item.link,
          author: item.source_name || 'Fact News',
          category: 'news',
          pubDate: item.pub_date,
          isRss: item.source_type === 'rss'
        }));
        
        if (onDataLoaded) {
          onDataLoaded(newsData);
        }
        
      } catch (error) {
        console.error('Error fetching BBC RSS:', error);
        
        const fallbackData = [
          {
            id: `fallback_${Date.now()}`,
            title: "Unable to load news",
            summary: "There was an issue connecting. Please check your internet connection or try again later.",
            image: "https://source.unsplash.com/800x500/?news,error",
            date: new Date().toLocaleDateString(),
            author: 'System',
            category: 'news'
          }
        ];
        
        if (onDataLoaded) {
          onDataLoaded(fallbackData);
        }
      }
    };

    fetchBBCNews();
  }, [onDataLoaded]);

  return null;
};

export default BBCNewsFetcher;
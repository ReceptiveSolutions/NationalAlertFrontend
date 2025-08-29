import React, { useEffect, useState } from 'react';

const BusinessNewsFetcher = ({ onDataLoaded, shouldFetch }) => {
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (shouldFetch && !hasFetched) {
      const fetchBusinessNews = async () => {
        try {
          const response = await // Fetch only RSS-based business articles
fetch(`${BASE_URL}/api/news/category/business?source=rss`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json(); // ✅ Parse JSON directly
          
          const newsData = data.map((item, index) => ({
            id: item.id || `business_${index}_${Date.now()}`,
            title: item.title,
            summary: item.summary || 'No summary available',
            description: item.summary || '',
            image: item.image_url || `https://source.unsplash.com/800x500/?business,economy,${index}`,
            date: new Date(item.pub_date || item.created_at).toLocaleDateString(),
            link: item.link,
            author: item.source_name || 'Unknown',
            category: 'business',
            pubDate: item.pub_date,
            isRss: item.source_type === 'rss'
          }));

          setHasFetched(true);
          if (onDataLoaded) {
            onDataLoaded(newsData);
          }

        } catch (error) {
          console.error('Error fetching Business news from API:', error);
          setHasFetched(true);

          const fallbackData = [{
            id: `fallback_${Date.now()}`,
            title: "Unable to load Business news",
            summary: "Please check your connection or try again later.",
            image: "https://source.unsplash.com/800x500/?business,error",
            date: new Date().toLocaleDateString(),
            author: 'System',
            category: 'business',
            isRss: true
          }];

          if (onDataLoaded) {
            onDataLoaded(fallbackData);
          }
        }
      };

      fetchBusinessNews();
    }
  }, [shouldFetch, hasFetched, onDataLoaded]);

  return null;
};

export default BusinessNewsFetcher;

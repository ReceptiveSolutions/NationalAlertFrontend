import React, { useEffect } from 'react';

const BBCNewsFetcher = ({ onDataLoaded }) => {
  useEffect(() => {
    const fetchBBCNews = async () => {
      try {
        // Using a CORS proxy to fetch RSS feed
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const rssUrl = 'http://feeds.bbci.co.uk/news/rss.xml';
        // const rssUrl = 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms';
        
        const response = await fetch(proxyUrl + encodeURIComponent(rssUrl));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          throw new Error('XML parsing error');
        }
        
        // Extract news items
        const items = xmlDoc.querySelectorAll('item');
        const newsData = Array.from(items).map((item, index) => {
          // Extract basic information
          const title = item.querySelector('title')?.textContent || 'No title available';
          const description = item.querySelector('description')?.textContent || 'No description available';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Extract image from media:thumbnail or description
          let imageUrl = '';
          const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
          if (mediaThumbnail) {
            imageUrl = mediaThumbnail.getAttribute('url') || '';
          } else {
            // Try to extract image from description HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            const img = tempDiv.querySelector('img');
            if (img) {
              imageUrl = img.src;
            }
          }
          
          // Clean description (remove HTML tags)
          const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
          
          // Format date
          const formattedDate = pubDate ? new Date(pubDate).toLocaleDateString() : new Date().toLocaleDateString();
          
          return {
            id: index,
            title: title,
            summary: cleanDescription,
            description: cleanDescription, // Keep both for compatibility
            image: imageUrl || `https://source.unsplash.com/800x500/?news,bbc,${index}`,
            date: formattedDate,
            link: link,
            author: 'BBC News',
            category: 'news',
            pubDate: pubDate
          };
        });
        
        // Call the callback with processed data
        if (onDataLoaded) {
          onDataLoaded(newsData);
        }
        
      } catch (error) {
        console.error('Error fetching BBC RSS:', error);
        
        // Provide fallback data in case of error
        const fallbackData = [
          {
            id: 0,
            title: "Unable to load BBC RSS feed",
            summary: "There was an issue connecting to the BBC news feed. Please check your internet connection or try again later.",
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

  return null; // This component doesn't render anything
};

export default BBCNewsFetcher;
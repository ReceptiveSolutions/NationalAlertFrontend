import React, { useEffect } from 'react';

const TimesOfIndiaEntertainmentFetcher = ({ onDataLoaded }) => {
  useEffect(() => {
    const fetchEntertainmentNews = async () => {
      try {
        // Using a CORS proxy to fetch RSS feed
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const rssUrl = 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms';
        
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
          
          // Extract image - Times of India often includes images in description
          let imageUrl = '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = description;
          const img = tempDiv.querySelector('img');
          if (img) {
            imageUrl = img.src;
          }
          
          // Clean description (remove HTML tags and image if present)
          let cleanDescription = description.replace(/<[^>]*>/g, '').trim();
          // Sometimes the image URL appears in text, remove it
          cleanDescription = cleanDescription.replace(imageUrl, '').trim();
          
          // Format date
          const formattedDate = pubDate ? new Date(pubDate).toLocaleDateString() : new Date().toLocaleDateString();
          
          return {
            id: index,
            title: title,
            summary: cleanDescription.length > 0 ? cleanDescription : "Entertainment news from Times of India",
            description: cleanDescription,
            image: imageUrl || `https://source.unsplash.com/800x500/?entertainment,bollywood,${index}`,
            date: formattedDate,
            link: link,
            author: 'Times of India',
            category: 'entertainment',
            pubDate: pubDate
          };
        });
        
        // Call the callback with processed data
        if (onDataLoaded) {
          onDataLoaded(newsData);
        }
        
      } catch (error) {
        console.error('Error fetching Times of India Entertainment RSS:', error);
        
        // Provide fallback data in case of error
        const fallbackData = [
          {
            id: 0,
            title: "Unable to load Entertainment news",
            summary: "There was an issue connecting to the entertainment feed. Please check your internet connection or try again later.",
            image: "https://source.unsplash.com/800x500/?entertainment,error",
            date: new Date().toLocaleDateString(),
            author: 'System',
            category: 'entertainment'
          }
        ];
        
        if (onDataLoaded) {
          onDataLoaded(fallbackData);
        }
      }
    };

    fetchEntertainmentNews();
  }, [onDataLoaded]);

  return null; // This component doesn't render anything
};

export default TimesOfIndiaEntertainmentFetcher;
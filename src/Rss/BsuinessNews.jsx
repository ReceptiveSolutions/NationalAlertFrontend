import React, { useEffect, useState } from 'react';

const TimesOfIndiaBusinessFetcher = ({ onDataLoaded, shouldFetch }) => {
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (shouldFetch && !hasFetched) {
      const fetchBusinessNews = async () => {
        try {
          // Using a CORS proxy to fetch RSS feed
          const proxyUrl = 'https://api.allorigins.win/raw?url=';
          const rssUrl = 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms';
          
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
              id: `toi_${index}_${Date.now()}`, // Unique ID with timestamp
              title: title,
              summary: cleanDescription.length > 0 ? cleanDescription : "Business news from Times of India",
              description: cleanDescription,
              image: imageUrl || `https://source.unsplash.com/800x500/?business,economy,${index}`,
              date: formattedDate,
              link: link,
              author: 'Times of India',
              category: 'business',
              pubDate: pubDate,
              isRss: true // Flag to identify RSS content
            };
          });
          
          setHasFetched(true);
          if (onDataLoaded) {
            onDataLoaded(newsData);
          }
          
        } catch (error) {
          console.error('Error fetching Times of India Business RSS:', error);
          setHasFetched(true);
          
          // Provide fallback data in case of error
          const fallbackData = [
            {
              id: `toi_fallback_${Date.now()}`,
              title: "Unable to load Business news",
              summary: "There was an issue connecting to the Times of India business feed. Please check your internet connection or try again later.",
              image: "https://source.unsplash.com/800x500/?business,error",
              date: new Date().toLocaleDateString(),
              author: 'System',
              category: 'business',
              isRss: true
            }
          ];
          
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

export default TimesOfIndiaBusinessFetcher;
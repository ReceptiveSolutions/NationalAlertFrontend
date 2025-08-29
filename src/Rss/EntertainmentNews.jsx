import React, { useEffect } from 'react';

const TimesOfIndiaEntertainmentFetcher = ({ onDataLoaded }) => {
  useEffect(() => {
    const fetchEntertainmentNews = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/news/category/entertainment?source=rss`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        let newsData = [];
        
        if (contentType && contentType.includes('application/json')) {
          // Handle JSON response
          console.log('📱 Processing JSON data from API');
          const jsonData = await response.json();
          newsData = processJsonData(jsonData);
        } else {
          // Handle XML/RSS response
          console.log('📰 Processing XML/RSS data');
          const xmlText = await response.text();
          newsData = processXmlData(xmlText);
        }
        
        console.log(`✅ Processed ${newsData.length} entertainment articles`);
        
        if (onDataLoaded) {
          onDataLoaded(newsData);
        }
        
      } catch (error) {
        console.error('Error fetching Times of India Entertainment news:', error);
        
        const fallbackData = [{
          id: 0,
          title: "Unable to load Entertainment news",
          summary: "There was an issue connecting to the entertainment feed. Please check your internet connection or try again later.",
          description: "There was an issue connecting to the entertainment feed. Please check your internet connection or try again later.",
          image: "https://source.unsplash.com/800x500/?entertainment,error",
          date: new Date().toLocaleDateString(),
          link: "",
          author: 'System',
          category: 'entertainment',
          pubDate: new Date().toISOString()
        }];
        
        if (onDataLoaded) {
          onDataLoaded(fallbackData);
        }
      }
    };

    const processJsonData = (jsonData) => {
      let items = [];
      if (Array.isArray(jsonData)) {
        items = jsonData;
      } else if (jsonData.items) {
        items = jsonData.items;
      } else if (jsonData.data) {
        items = jsonData.data;
      } else {
        items = [jsonData];
      }
      
      return items.map((item, index) => {
        const title = item.title || 'No title available';
        const description = item.description || item.summary || item.content || 'No description available';
        const cleanDescription = typeof description === 'string' 
          ? description.replace(/<[^>]*>/g, '').trim() 
          : description;
        
        return {
          id: item.id || index,
          title: title,
          summary: cleanDescription.length > 0 ? cleanDescription : "Entertainment news from Times of India",
          description: cleanDescription,
          image: item.image || item.imageUrl || `https://source.unsplash.com/800x500/?entertainment,bollywood,${index}`,
          date: item.date ? new Date(item.date).toLocaleDateString() : new Date().toLocaleDateString(),
          link: item.link || item.url || '',
          author: item.author || 'Times of India',
          category: 'entertainment',
          pubDate: item.pubDate || item.publishedAt || item.date || new Date().toISOString()
        };
      });
    };

    const processXmlData = (xmlText) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing error');
      }
      
      const items = xmlDoc.querySelectorAll('item');
      return Array.from(items).map((item, index) => {
        const title = item.querySelector('title')?.textContent || 'No title available';
        const description = item.querySelector('description')?.textContent || 'No description available';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        let imageUrl = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        const img = tempDiv.querySelector('img');
        if (img) {
          imageUrl = img.src;
        }
        
        let cleanDescription = description.replace(/<[^>]*>/g, '').trim();
        cleanDescription = cleanDescription.replace(imageUrl, '').trim();
        
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
    };

    fetchEntertainmentNews();
  }, [onDataLoaded]);

  return null;
};

export default TimesOfIndiaEntertainmentFetcher;
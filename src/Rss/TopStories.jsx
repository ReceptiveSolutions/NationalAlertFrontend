import React, {useEffect} from 'react'

 const TopStorieFetcher = ({onDataLoaded}) => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchTopStories = async () => {
            try{

                const response = await fetch(`${BASE_URL}/api/news?category=top-stories&limit=20`);

                if(!response.ok){
                    throw new Error(`HTTP error! status: ${response.status}`);
                }


                const data = await response.json(); // parse JSON instead of the XML 

                const newsData = data.map((item, index) => ({

                    id:item.id || `toi_${index}_${Date.now()}`, 
                    title: item.title,
                    summary: item.summary || 'No Summary available',
                    description: item.image_url || `https://source.unsplash.com/800x500/?news,toi,${index}`,
                    image: item.link,
                    date : new Date(item.pub_date || item.created_at).toLocaleDateString(),
                    link: item.link,
                    author : item.source_name || "Fact News",
                    category : 'news',
                    pubDate: item.pub_date,
                    isRss: item.source_type === 'rss'
                }));

                if(onDataLoaded){
                    onDataLoaded(newsData);
                }

            }catch{
                    console.error('Error fetching TOI News:', error);

                    const fallbackData = [

                        {
                           summary: "There was an issue connecting. Please check your internet connection or try again later.",
            image: "https://source.unsplash.com/800x500/?news,error",
            date: new Date().toLocaleDateString(),
            author: 'System',
            category: 'news'
                        }
                    ];

                    if(onDataLoaded){
                        onDataLoaded(fallbackData);
                    }
            }


        };
        fetchTopStories();
    },  [onDataLoaded])

    return null;
 };
 export default fetchTopStories;
import React, {useEffect, useState} from 'react'

const HealthApi = ({onDataLoaded}) => {

    const apiKey = import.meta.env.VITE_NEWS1_KEY;
    const [isRetrying, setIsRetrying] = useState(false);

    // Generate fallback if API fails 
    const generateFallbackDatac= () => {
        const categories = ['Coronavirus', 'Diseases', 'Vaccines', 'Healthcare', 'Nutrition', 'Wellness'];
        const fallbackData = [];

        for (let i =0; i < 15; i++){
            const category = categories[i % categories.length];

            fallbackData.push({
                id: i,
                title: `${category} News : This is a placeholder headline for ${category} news story ${i+1}`,
                summary: `This is palceholder content for a health news article that coludn't be loaded from the API . This would normall conatin a summary of the latest ${category.toLowerCase()} news.`,
                image: `https://source.unsplash.com/random/800x500/?${category.toLowerCase()},health`,
                date: new Date().toLocaleDateString(),
            });
        }

        return fallbackData;
    }; 


    // check Local Storage for cached data 

    const getCachedData = () => {
        const cachedDataStr = localStorage.getItem('healthNewsData');
        const cachedTimesTamp = localStorage.getItem('healthNewsDataTimestamp');

        if ( cachedDataStr && cachedTimesTamp){
            // Check if cache is still vaild (less than 15 minutes old)
            const now = new Date().getTime();
           
        }
    }

}
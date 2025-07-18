import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiStar,
  FiTrendingUp,
  FiClock,
  FiFilm,
  FiTv,
  FiMusic,
  FiAward,
  FiArrowRight,
} from "react-icons/fi";
import { Newspaper } from "lucide-react";
import EntertainmentApi from "../api/entertainmentapi";
import TimesOfIndiaEntertainmentFetcher from "../Rss/EntertainmentNews"; // Adjust path as needed
import { EheroCards, ElatestCards } from "../components/index";

const Entertainment = () => {
  const navigate = useNavigate();
  const [featuredContent, setFeaturedContent] = useState([]);
  const [latestContent, setLatestContent] = useState([]);
  const [rssContent, setRssContent] = useState([]);
  const [trendingContent, setTrendingContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRss, setIsLoadingRss] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [error, setError] = useState(null);
  const [expandedArticles, setExpandedArticles] = useState({});
  const [displayCount, setDisplayCount] = useState(6);
  const [showRssData, setShowRssData] = useState(false);
  const [rssDataLoaded, setRssDataLoaded] = useState(false);
  const [rssDisplayCount, setRssDisplayCount] = useState(4); // Add RSS display count

  // In-memory storage for articles (fallback when localStorage isn't available)
  const [articleStorage, setArticleStorage] = useState({});

  // Debug log to check if loadMoreContent is called
  console.log(`Current display count: ${displayCount}`);

  // Helper function to count words
  const countWords = (str) => {
    if (!str) return 0;
    return str.split(/\s+/).filter(Boolean).length;
  };

  // Helper function to check if content has more than 50 words
  const hasMoreThan50Words = (text) => {
    if (!text) return false;
    const wordCount = countWords(text);
    return wordCount > 50;
  };

  // Function to store article data (similar to sports page)
  const storeArticle = (article) => {
    const articleData = {
      ...article,
      date: article.date || new Date().toLocaleDateString(),
      author: article.author || "Entertainment Reporter",
      readTime:
        article.readTime ||
        `${Math.ceil(countWords(article.summary || "") / 200)} min read`,
      content: article.summary || article.content || "No content available",
      category: "Entertainment",
      subcategory: article.subcategory || "General",
    };

    // Store in component state as fallback
    setArticleStorage((prev) => ({
      ...prev,
      [article.id]: articleData,
    }));

    // Try to store in localStorage if available
    try {
      if (typeof Storage !== "undefined") {
        localStorage.setItem(
          `article_${article.id}`,
          JSON.stringify(articleData)
        );

        // Store in entertainment category cache as well
        const existingEntertainmentData = JSON.parse(
          localStorage.getItem("entertainmentData") || "[]"
        );
        const updatedEntertainmentData = existingEntertainmentData.some(
          (item) => item.id === article.id
        )
          ? existingEntertainmentData
          : [...existingEntertainmentData, articleData];
        localStorage.setItem(
          "entertainmentData",
          JSON.stringify(updatedEntertainmentData)
        );

        console.log("Article stored in localStorage:", article.id);
      }
    } catch (error) {
      console.warn("localStorage not available, using in-memory storage");
    }

    return articleData;
  };

  // Helper function to get button text based on word count
  const getButtonText = (content, isExpanded) => {
    const moreThan50Words = hasMoreThan50Words(content.summary);

    if (moreThan50Words) {
      return "View full article";
    } else {
      return isExpanded ? "Show less" : "Read more";
    }
  };

  const handleReadMore = (content) => {
    // Check if content description is more than 50 words
    const wordCount = countWords(content.summary);

    if (wordCount > 50) {
      // Store article data before navigation
      const storedArticle = storeArticle(content);
      console.log("Stored article:", storedArticle);

      // Navigate to article detail page
      navigate(`/article/${content.id}`);
    } else {
      // For shorter content, just toggle expansion
      toggleExpand(content.id);
    }
  };

  const toggleExpand = (articleId) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // Fixed loadMoreContent function
  const loadMoreContent = () => {
    if (!rssDataLoaded) {
      // First time clicking - load RSS data
      setIsLoadingRss(true);
      setShowRssData(true);
      // The RSS component will be rendered and will call handleRssDataLoaded
    } else {
      // RSS data already loaded, increment both counters
      setDisplayCount((prevCount) => prevCount + 4);
      setRssDisplayCount((prevCount) => prevCount + 4);
    }
  };

  // New function to handle RSS data loading
  const handleRssDataLoaded = (rssData) => {
    try {
      if (rssData && rssData.length > 0) {
        // Process RSS data to match the expected format
        const processedRssData = rssData.map((item, index) => ({
          ...item,
          id: `rss-${index}`, // Prefix with 'rss-' to distinguish from API data
          subcategory: item.category || "Entertainment",
          readTime: `${Math.max(
            1,
            Math.floor((item.summary?.length || 0) / 200)
          )} min read`,
          isHot: false,
          rating: Math.min(5, (index % 3) + 3), // Generate ratings 3-5
          source: "RSS", // Add source identifier
        }));

        setRssContent(processedRssData);
        setRssDataLoaded(true);

        // Store RSS articles in localStorage
        processedRssData.forEach((article) => {
          storeArticle(article);
        });
      }
    } catch (error) {
      console.error("Error processing RSS data:", error);
    } finally {
      setIsLoadingRss(false);
    }
  };

  const handleDataLoaded = (apiData) => {
    try {
      if (!apiData || apiData.length === 0) {
        throw new Error("No entertainment data available");
      }

      // Process entertainment data
      const processedData = apiData.map((item, index) => ({
        id: `main-${index}`,
        title: item.title || "No title available",
        summary: item.summary || "No description available",
        image:
          item.image ||
          `https://source.unsplash.com/random/800x500/?entertainment,${item.subcategory.toLowerCase()}`,
        date: item.date || new Date().toLocaleDateString(),
        category: item.category || "Entertainment",
        subcategory: item.subcategory || "General",
        readTime: `${Math.max(
          1,
          Math.floor((item.summary?.length || 0) / 200)
        )} min read`,
        isHot: index % 5 === 0,
        rating: Math.min(5, (index % 5) + 3), // Generate ratings 3-5
        source: "API", // Add source identifier
      }));

      // Generate more simulated data if needed
      let extendedData = [...processedData];
      if (processedData.length < 30) {
        // Create duplicates with slight modifications if not enough data
        for (let i = 0; i < 20; i++) {
          const originalItem = processedData[i % processedData.length];
          extendedData.push({
            ...originalItem,
            id: `main-${processedData.length + i}`,
            title: originalItem.title
              ? `${originalItem.title} - Extended`
              : "No title available",
            summary: originalItem.summary
              ? `${originalItem.summary.substring(0, 50)}... `
              : "No description available",
            source: "API",
          });
        }
      }

      setFeaturedContent(extendedData.slice(0, 6));
      // Store all latest content, but only display based on displayCount
      setLatestContent(extendedData.slice(6, 30)); // Ensuring we have more content items available

      console.log(`Latest content count: ${extendedData.slice(6, 30).length}`); // Debug log

      // Store all articles in localStorage
      extendedData.forEach((article) => {
        storeArticle(article);
      });

      // Store trending content as well
      setTrendingContent((prev) => {
        prev.forEach((article) => storeArticle(article));
        return prev;
      });

      setError(null);
    } catch (err) {
      console.error("Error processing entertainment data:", err);
      setError("Unable to load entertainment content. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh entertainment data (similar to sports page)
  const refreshEntertainment = () => {
    setIsLoading(true);
    setFeaturedContent([]);
    setLatestContent([]);
    setRssContent([]);
    setTrendingContent([]);
    setArticleStorage({}); // Clear article storage
    setRssDataLoaded(false);
    setShowRssData(false);
    setDisplayCount(6);
    setRssDisplayCount(4); // Reset RSS display count

    // Clear localStorage entertainment data if needed
    try {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem("entertainmentData");
        console.log("Entertainment localStorage data cleared");
      }
    } catch (error) {
      console.warn("Could not clear localStorage");
    }
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto"></div>
          <Newspaper
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500"
            size={32}
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Loading Latest News
        </h2>
        <p className="text-gray-400">Fetching the most recent updates...</p>
      </div>
    </div>
  );

  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black px-4">
      <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-md max-w-md w-full text-center border border-pink-500">
        <div className="text-pink-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Showtime Interrupted!
        </h2>
        <p className="text-gray-300 mb-6">
          We're experiencing technical difficulties backstage. The show will go
          on shortly!
        </p>
        <button
          onClick={refreshEntertainment}
          className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-full transition duration-300 shadow-lg hover:shadow-pink-500/30 cursor-pointer"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );

  const categoryIcons = {
    Movies: <FiFilm className="mr-2" />,
    "TV Shows": <FiTv className="mr-2" />,
    Music: <FiMusic className="mr-2" />,
    Awards: <FiAward className="mr-2" />,
    General: <FiStar className="mr-2" />,
  };

  // Fixed function to get content to display (API + RSS)
  const getContentToDisplay = () => {
    let contentToShow = latestContent
      .filter(
        (content) =>
          activeCategory === "all" ||
          content.subcategory.toLowerCase().includes(activeCategory)
      )
      .slice(0, displayCount);

    // Add RSS content if it should be shown, but respect rssDisplayCount
    if (showRssData && rssContent.length > 0) {
      const rssToShow = rssContent
        .filter(
          (content) =>
            activeCategory === "all" ||
            content.subcategory.toLowerCase().includes(activeCategory)
        )
        .slice(0, rssDisplayCount); // Use rssDisplayCount instead of showing all
      contentToShow = [...contentToShow, ...rssToShow];
    }

    return contentToShow;
  };

  // Check if there's more content to load
  const hasMoreContent = () => {
    const filteredLatest = latestContent.filter(
      (content) =>
        activeCategory === "all" ||
        content.subcategory.toLowerCase().includes(activeCategory)
    );
    
    const filteredRss = rssContent.filter(
      (content) =>
        activeCategory === "all" ||
        content.subcategory.toLowerCase().includes(activeCategory)
    );

    return (
      filteredLatest.length > displayCount ||
      (!rssDataLoaded && filteredLatest.length > 0) ||
      (rssDataLoaded && filteredRss.length > rssDisplayCount)
    );
  };

  return (
    <div className="bg-gradient-to-b from-purple-900 to-black min-h-screen text-white">
      <EntertainmentApi onDataLoaded={handleDataLoaded} />

      {/* Conditionally render RSS fetcher when needed */}
      {showRssData && !rssDataLoaded && (
        <TimesOfIndiaEntertainmentFetcher onDataLoaded={handleRssDataLoaded} />
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorDisplay />
      ) : (
        <section>
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white py-10 px-6 lg:px-10">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <FiTrendingUp className="mr-2 text-yellow-300" />
                      <span className="text-sm font-medium">
                        POPULAR THIS WEEK
                      </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                      Lights, Camera,{" "}
                      <span className="text-yellow-300">Action!</span>
                    </h1>
                    <p className="text-lg opacity-90 max-w-3xl">
                      Your backstage pass to the hottest entertainment news and
                      celebrity buzz
                    </p>
                  </div>
                  <div className="hidden lg:block relative">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-overlay opacity-20"></div>
                    <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-pink-400 rounded-full mix-blend-overlay opacity-20"></div>
                  </div>
                </div>

                {/* Featured Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featuredContent.map((content, index) => (
                    <EheroCards
                      key={content.id}
                      content={content}
                      index={index}
                      onStoreArticle={storeArticle}
                      categoryIcons={categoryIcons}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          
         {/* Main Content */}
<main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
  {/* Latest Content Section - Now Full Width */}
  <div className="w-full">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-3xl font-bold text-white flex items-center">
        <FiClock className="mr-3 text-pink-500" />
        Latest Updates
      </h2>
    </div>

    <div className="space-y-6">
      {getContentToDisplay().map((content) => (
        <ElatestCards
          key={content.id}
          content={content}
          onStoreArticle={storeArticle}
        />
      ))}

      {/* Load More Button */}
      {hasMoreContent() && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreContent}
            disabled={isLoadingRss}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-full shadow-lg hover:shadow-pink-500/30 transition-all duration-300 flex items-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoadingRss ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading Content...
              </>
            ) : (
              <>
                {rssDataLoaded
                  ? "Load More Content"
                  : "Load Content"}
                <FiArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  </div>
</main>
        </section>
      )}
    </div>
  );
};

export default Entertainment;
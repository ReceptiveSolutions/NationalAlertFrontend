import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiBarChart2,
  FiPieChart,
  FiShield,
  FiDroplet,
  FiChevronDown,
  FiChevronUp,
  FiArrowRight,
  FiActivity,
  FiDollarSign,
} from "react-icons/fi";
import { Newspaper } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ShareMarketApi from "../api/bsuinessapi";
import TimesOfIndiaBusinessFetcher from "../Rss/BsuinessNews";
import { BheroCards, BotherCards } from "../components/index";

const ShareMarket = () => {
  const navigate = useNavigate();
  const [featuredStocks, setFeaturedStocks] = useState([]);
  const [latestMarketNews, setLatestMarketNews] = useState([]);
  const [rssNewsData, setRssNewsData] = useState([]);
  const [displayedRssNews, setDisplayedRssNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [error, setError] = useState(null);
  const [expandedArticles, setExpandedArticles] = useState({});
  const [displayCount, setDisplayCount] = useState(6);
  const [rssLoadCount, setRssLoadCount] = useState(0);
  const [hasLoadedRss, setHasLoadedRss] = useState(false);

  // In-memory storage for articles (fallback when localStorage isn't available)
  const [articleStorage, setArticleStorage] = useState({});

  // Debug log to check if loadMoreContent is called and the current display count
  useEffect(() => {
    console.log(`Current display count: ${displayCount}`);
    console.log(`Total latest market news items: ${latestMarketNews.length}`);
    console.log(`RSS news loaded: ${displayedRssNews.length}`);
    console.log(
      `Number of items being displayed: ${Math.min(
        displayCount,
        latestMarketNews.length
      )}`
    );
  }, [displayCount, latestMarketNews.length, displayedRssNews.length]);

  // Function to count words in a string
  const countWords = (text) => {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  const storeArticle = (article) => {
    const articleData = {
      ...article,
      date: article.date || new Date().toLocaleDateString(),
      isBreaking: article.isHot || false,
      author: article.author || "Market Analyst",
      readTime:
        article.readTime ||
        `${Math.ceil(countWords(article.summary || "") / 200)} min read`,
      image: article.image,
      content: [
        {
          subheading: "Market Analysis",
          text: article.summary || "No content available",
        },
      ],
      // Standardize category naming
      category: "business", // Changed from 'ShareMarket' to match search expectations
      subcategory: article.subcategory || "Market News",
    };

    // Store in component state
    setArticleStorage((prev) => ({
      ...prev,
      [article.id]: articleData,
    }));

    try {
      if (typeof Storage !== "undefined") {
        // Store individual article
        localStorage.setItem(
          `article_${article.id}`,
          JSON.stringify(articleData)
        );

        // Store in both businessData and shareMarketData for compatibility
        const existingBusinessData = JSON.parse(
          localStorage.getItem("businessData") || "[]"
        );
        const updatedBusinessData = existingBusinessData.some(
          (item) => item.id === article.id
        )
          ? existingBusinessData
          : [...existingBusinessData, articleData];
        localStorage.setItem(
          "businessData",
          JSON.stringify(updatedBusinessData)
        );

        // Maintain shareMarketData for backward compatibility
        const existingShareMarketData = JSON.parse(
          localStorage.getItem("shareMarketData") || "[]"
        );
        const updatedShareMarketData = existingShareMarketData.some(
          (item) => item.id === article.id
        )
          ? existingShareMarketData
          : [...existingShareMarketData, articleData];
        localStorage.setItem(
          "shareMarketData",
          JSON.stringify(updatedShareMarketData)
        );

        console.log("Article stored in:", {
          individual: `article_${article.id}`,
          businessData: updatedBusinessData.length,
          shareMarketData: updatedShareMarketData.length,
        });
      }
    } catch (error) {
      console.error("Storage error:", error);
    }

    return articleData;
  };
  // Function to get button text based on word count and expanded state
  const getButtonText = (article, section, sectionSpecificId) => {
    const wordCount = countWords(article.summary);
    const isExpanded = expandedArticles[sectionSpecificId];

    if (wordCount > 50) {
      return "View full article";
    } else {
      return isExpanded ? "Show less" : "Read more";
    }
  };

  // Handle click on Read More button
  const handleReadMoreClick = (article, section) => {
    // Create a section-specific ID to avoid conflicts
    const sectionSpecificId = `${section}_${article.id}`;

    // Check if the description has more than 50 words
    if (countWords(article.summary) > 50) {
      // Store article data before navigating
      const storedArticle = storeArticle(article);
      console.log("Stored article for navigation:", storedArticle);

      // Navigate to the article detail page
      navigate(`/article/${article.id}`);
    } else {
      // For short descriptions, just toggle expand/collapse using section-specific ID
      toggleExpand(sectionSpecificId);
    }
  };

  const toggleExpand = (articleId) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // Update the loadMoreContent function:
  const loadMoreContent = () => {
    setIsLoadingMore(true);

    // If we have RSS data that hasn't been displayed yet
    if (rssNewsData.length > 0 && rssLoadCount < rssNewsData.length) {
      const nextBatch = rssNewsData.slice(rssLoadCount, rssLoadCount + 4);
      setDisplayedRssNews((prev) => [...prev, ...nextBatch]);
      setRssLoadCount((prev) => prev + 4);
      setIsLoadingMore(false);
      return;
    }

    // If we haven't loaded RSS data yet, trigger the fetch
    if (!hasLoadedRss) {
      setHasLoadedRss(true);
    } else {
      // If we've already loaded all RSS data, just increase display count for API content
      setDisplayCount((prev) => prev + 4);
      setIsLoadingMore(false);
    }
  };

  const handleDataLoaded = (apiData) => {
    try {
      if (!apiData || apiData.length === 0) {
        throw new Error("No market data available");
      }

      // Generate more simulated data if needed
      let extendedData = [...apiData];
      if (apiData.length < 30) {
        // Create duplicates with slight modifications if not enough data
        for (let i = 0; i < 20; i++) {
          const originalItem = apiData[i % apiData.length];
          const stockChange =
            Math.random() > 0.5
              ? `+${(Math.random() * 5).toFixed(2)}%`
              : `-${(Math.random() * 3).toFixed(2)}%`;

          extendedData.push({
            ...originalItem,
            id: originalItem.id + apiData.length + i, // Ensure unique IDs
            title: originalItem.title
              ? `${originalItem.title} - Extended Data ${i + 1}`
              : "No title available",
            summary: originalItem.summary
              ? `${originalItem.summary.substring(0, 50)} ${i + 1}`
              : "",
            stockChange: stockChange,
            stockPrice: `$${(Math.random() * 1000 + 10).toFixed(2)}`,
            stockVolume: `${(Math.random() * 10).toFixed(1)}M`,
          });
        }
      }

      // Process market data
      const processedData = extendedData.map((item, index) => ({
        id: item.id || index,
        title: item.title || "No title available",
        summary: item.summary || "No description available",
        image:
          item.image ||
          `https://source.unsplash.com/random/800x500/?finance,${(
            item.subcategory || "stocks"
          ).toLowerCase()}`,
        date: item.date || new Date().toLocaleDateString(),
        category: item.category || "Business",
        subcategory:
          item.subcategory ||
          [
            "Stocks",
            "Cryptocurrency",
            "Commodities",
            "Forex",
            "IPO",
            "Mutual Funds",
          ][index % 6],
        readTime: `${Math.max(
          1,
          Math.floor((item.summary?.length || 0) / 200)
        )} min read`,
        isHot: (item.stockChange || "").includes("+"),
        stockPrice:
          item.stockPrice || `$${(Math.random() * 1000 + 10).toFixed(2)}`,
        stockChange:
          item.stockChange ||
          (Math.random() > 0.5
            ? `+${(Math.random() * 5).toFixed(2)}%`
            : `-${(Math.random() * 3).toFixed(2)}%`),
        stockVolume: item.stockVolume || `${(Math.random() * 10).toFixed(1)}M`,
        sentiment: (item.stockChange || "").includes("+")
          ? "bullish"
          : "bearish",
      }));

      // Use first 6 items for featured stocks
      const featuredData = processedData.slice(0, 6);
      setFeaturedStocks(featuredData);

      // Store all latest content, but only display based on displayCount
      const latestData = processedData.slice(6, 30);
      setLatestMarketNews(latestData);

      // Store all articles in localStorage
      [...featuredData, ...latestData].forEach((article) => {
        storeArticle(article);
      });

      console.log(`Latest market news count: ${latestData.length}`);

      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error("Error processing market data:", err);
      setError("Unable to load market content. Please try again later.");
      setIsLoading(false);
    }
  };

  // Handle RSS data loaded
  const handleRssDataLoaded = (rssData) => {
    console.log("RSS data loaded:", rssData.length);

    // Process RSS data to match our card format
    const processedRssData = rssData.map((item, index) => ({
      id: `rss_${item.id || index}`,
      title: item.title || "No title available",
      summary: item.summary || item.description || "No description available",
      image:
        item.image ||
        `https://source.unsplash.com/random/800x500/?business,news,${index}`,
      date: item.date || new Date().toLocaleDateString(),
      category: "Business",
      subcategory: "News",
      readTime: `${Math.max(
        1,
        Math.floor((item.summary?.length || 0) / 200)
      )} min read`,
      author: item.author || "Times of India",
      link: item.link || "",
      isRss: true, // Flag to identify RSS content
      stockPrice: `$${(Math.random() * 1000 + 10).toFixed(2)}`,
      stockChange:
        Math.random() > 0.5
          ? `+${(Math.random() * 5).toFixed(2)}%`
          : `-${(Math.random() * 3).toFixed(2)}%`,
      stockVolume: `${(Math.random() * 10).toFixed(1)}M`,
    }));

    setRssNewsData(processedRssData);

    // Store RSS articles in localStorage
    processedRssData.forEach((article) => {
      storeArticle(article);
    });

    // Load first batch of RSS news
    const firstBatch = processedRssData.slice(0, 4);
    setDisplayedRssNews(firstBatch);
    setRssLoadCount(4);
    setIsLoadingMore(false);
  };

  // Store articles when they're loaded/updated
  useEffect(() => {
    if (featuredStocks.length > 0) {
      featuredStocks.forEach((article) => {
        if (!articleStorage[article.id]) {
          storeArticle(article);
        }
      });
    }
  }, [featuredStocks]);

  useEffect(() => {
    if (latestMarketNews.length > 0) {
      latestMarketNews.forEach((article) => {
        if (!articleStorage[article.id]) {
          storeArticle(article);
        }
      });
    }
  }, [latestMarketNews]);

  useEffect(() => {
    if (displayedRssNews.length > 0) {
      displayedRssNews.forEach((article) => {
        if (!articleStorage[article.id]) {
          storeArticle(article);
        }
      });
    }
  }, [displayedRssNews]);

  // Function to refresh news and clear storage
  const refreshNews = () => {
    setIsLoading(true);
    setFeaturedStocks([]);
    setLatestMarketNews([]);
    setRssNewsData([]);
    setDisplayedRssNews([]);
    setDisplayCount(6);
    setRssLoadCount(0);
    setHasLoadedRss(false);
    setArticleStorage({});

    // Clear localStorage
    try {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem("shareMarketData");
        console.log("ShareMarket localStorage cleared");
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Loading Latest News
        </h2>
        <p className="text-gray-400">Fetching the most recent updates...</p>
      </div>
    </div>
  );
  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-black px-4">
      <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-md max-w-md w-full text-center border border-blue-500">
        <div className="text-blue-500 mb-4">
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
          Market Data Unavailable!
        </h2>
        <p className="text-gray-300 mb-6">
          We're experiencing technical difficulties with our market data feed.
          Please try again shortly!
        </p>
        <button
          onClick={refreshNews}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-300 shadow-lg hover:shadow-blue-500/30"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );

  const categoryIcons = {
    Stocks: <FiBarChart2 className="mr-2" />,
    Cryptocurrency: <FiActivity className="mr-2" />,
    Commodities: <FiDroplet className="mr-2" />,
    Forex: <FiDollarSign className="mr-2" />,
    IPO: <FiPieChart className="mr-2" />,
    "Mutual Funds": <FiShield className="mr-2" />,
    News: <Newspaper className="mr-2" size={16} />,
  };

  // Get filtered items based on current category
  const getFilteredMarketNews = () => {
    return latestMarketNews.filter(
      (content) =>
        activeCategory === "all" ||
        (activeCategory === "stocks" && content.subcategory === "Stocks") ||
        (activeCategory === "crypto" &&
          content.subcategory === "Cryptocurrency")
    );
  };

  // Render RSS news cards
  const renderRssNewsCard = (content) => {
    // Your RSS card rendering logic or use BotherCards for RSS too
    return (
      <BotherCards
        key={content.id}
        id={content.id}
        title={content.title}
        description={content.summary || content.description}
        image={content.image}
        date={content.date}
        isExpanded={expandedArticles[`rss_${content.id}`]}
        onReadMore={() => handleReadMoreClick(`rss_${content.id}`)}
        fallbackImageCategory="news"
        maxWords={50}
      />
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen text-white">
      <ShareMarketApi onDataLoaded={handleDataLoaded} />

      {/* Replace this line with the controlled RSS fetcher */}
      <TimesOfIndiaBusinessFetcher
        onDataLoaded={handleRssDataLoaded}
        shouldFetch={hasLoadedRss}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorDisplay />
      ) : (
        <section>
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="bg-gray-100 text-black py-10 px-6 lg:px-10">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <FiTrendingUp className="mr-2 text-green-300" />
                      <span className="text-sm font-medium">MARKET PULSE</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                      Market <span className="text-green-300">Insights</span>
                    </h1>
                    <p className="text-lg opacity-90 max-w-3xl">
                      Track the latest trends and stay ahead with real-time
                      market analysis
                    </p>
                  </div>
                  <div className="hidden lg:block relative">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400 rounded-full mix-blend-overlay opacity-20"></div>
                    <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-blue-400 rounded-full mix-blend-overlay opacity-20"></div>
                  </div>
                </div>

                {/* Featured Stocks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featuredStocks.map((stock, index) => (
                    <BheroCards
                      key={stock.id}
                      stock={stock}
                      index={index}
                      expandedArticles={expandedArticles}
                      handleReadMoreClick={handleReadMoreClick}
                      getButtonText={getButtonText}
                      countWords={countWords}
                      categoryIcons={categoryIcons}
                    />
                  ))}{" "}
                </div>
              </div>
            </div>
          </section>

          {/* Main Content - Latest Market News */}
          <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 bg-gray-100">
            <div className="space-y-6">
              {/* API-sourced news */}
              {getFilteredMarketNews()
                .slice(0, displayCount)
                .map((content) => (
                  <BotherCards
                    key={content.id}
                    id={content.id}
                    title={content.title}
                    description={content.summary}
                    image={content.image}
                    date={content.date}
                    isExpanded={expandedArticles[content.id]}
                    onReadMore={handleReadMoreClick}
                    fallbackImageCategory={
                      content.subcategory?.toLowerCase() || "finance"
                    }
                    maxWords={50}
                  />
                ))}
              {/* RSS-sourced news */}
              {displayedRssNews.map((content) => renderRssNewsCard(content))}

              {/* Show Load More button */}
              {(getFilteredMarketNews().length > displayCount ||
                rssLoadCount < rssNewsData.length ||
                !hasLoadedRss) && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreContent}
                    disabled={isLoadingMore}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center group disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Loading More News...
                      </>
                    ) : (
                      <>
                        Load More Market News
                        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </main>
        </section>
      )}
    </div>
  );
};

export default ShareMarket;

import React, { useState, useEffect, useMemo } from "react";
import {
  FiTrendingUp,
  FiBarChart2,
  FiPieChart,
  FiShield,
  FiDroplet,
  FiArrowRight,
  FiActivity,
  FiDollarSign,
} from "react-icons/fi";
import { Newspaper } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ShareMarketApi from "../api/bsuinessapi";
import TimesOfIndiaBusinessFetcher from "../Rss/BsuinessNews";
import { BheroCards, BotherCards, Bslider } from "../components/index";

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
  const [articleStorage, setArticleStorage] = useState({});

  // Function to count words in a string
  const countWords = (text) => {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  // Simplified storeArticle function - all data in memory only
  const storeArticle = (article, isRssData = false) => {
    const articleData = {
      ...article,
      date: article.date || new Date().toLocaleDateString(),
      isBreaking: article.isHot || false,
      author:
        article.author || (isRssData ? "Times of India" : "Market Analyst"),
      readTime:
        article.readTime ||
        `${Math.ceil(countWords(article.summary || "") / 200)} min read`,
      image: article.image,
      content: [
        {
          subheading: isRssData ? "Business News" : "Market Analysis",
          text: article.summary || "No content available",
        },
      ],
      category: "business",
      subcategory: article.subcategory || (isRssData ? "News" : "Market News"),
      isRssData: isRssData,
    };

    setArticleStorage((prev) => ({
      ...prev,
      [article.id]: articleData,
    }));

    console.log(`🧠 Article "${article.title}" stored in memory only`);
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
    const sectionSpecificId = `${section}_${article.id}`;

    if (countWords(article.summary) > 50) {
      const isRss = article.isRss || section === "rss";
      const storedArticle = storeArticle(article, isRss);
      console.log("📄 Stored article for navigation:", storedArticle);
      navigate(`/article/${article.id}`);
    } else {
      toggleExpand(sectionSpecificId);
    }
  };

  const toggleExpand = (articleId) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  const loadMoreContent = () => {
    setIsLoadingMore(true);
    console.log("🔄 Loading more content...");

    if (rssNewsData.length > 0 && rssLoadCount < rssNewsData.length) {
      const nextBatch = rssNewsData.slice(rssLoadCount, rssLoadCount + 4);
      setDisplayedRssNews((prev) => [...prev, ...nextBatch]);
      setRssLoadCount((prev) => prev + 4);
      console.log(
        `📰 Loaded ${nextBatch.length} more RSS articles (stored in memory only)`
      );
      setIsLoadingMore(false);
      return;
    }

    if (!hasLoadedRss) {
      setHasLoadedRss(true);
      console.log("📡 RSS loading enabled");
    } else {
      setDisplayCount((prev) => prev + 4);
      console.log("📈 Loading more API data (memory only)");
      setIsLoadingMore(false);
    }
  };

  // handleDataLoaded - Hero gets latest only
  const handleDataLoaded = (apiData) => {
    try {
      if (!apiData || apiData.length === 0) {
        throw new Error("No market data available");
      }

      console.log("📊 Processing API data - Latest cycle");

      let extendedData = [...apiData];
      if (apiData.length < 30) {
        for (let i = 0; i < 20; i++) {
          const originalItem = apiData[i % apiData.length];
          const stockChange =
            Math.random() > 0.5
              ? `+${(Math.random() * 5).toFixed(2)}%`
              : `-${(Math.random() * 3).toFixed(2)}%`;

          extendedData.push({
            ...originalItem,
            id: originalItem.id + apiData.length + i,
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
        isRssData: false,
      }));

      // HERO SECTION: Only latest data (first 6 items)
      const featuredData = processedData.slice(0, 6);
      setFeaturedStocks(featuredData);
      console.log(
        `🏆 Hero section updated with ${featuredData.length} latest articles`
      );

      // LATEST NEWS: Next batch for the main content
      const latestData = processedData.slice(6, 30);
      setLatestMarketNews(latestData);

      // Store API data in memory only
      [...featuredData, ...latestData].forEach((article) => {
        storeArticle(article, false);
      });

      console.log(
        `✅ ${processedData.length} API articles processed and stored in memory only`
      );

      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Error processing market data:", err);
      setError("Unable to load market content. Please try again later.");
      setIsLoading(false);
    }
  };

  // Modified handleRssDataLoaded - RSS data stays in memory only
  const handleRssDataLoaded = (rssData) => {
    console.log("📰 Processing RSS data - will be stored in memory only");

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
      isRss: true,
      isRssData: true,
      stockPrice: `$${(Math.random() * 1000 + 10).toFixed(2)}`,
      stockChange:
        Math.random() > 0.5
          ? `+${(Math.random() * 5).toFixed(2)}%`
          : `-${(Math.random() * 3).toFixed(2)}%`,
      stockVolume: `${(Math.random() * 10).toFixed(1)}M`,
    }));

    setRssNewsData(processedRssData);

    // Store RSS data in memory only
    processedRssData.forEach((article) => {
      storeArticle(article, true);
    });

    console.log(
      `✅ ${processedRssData.length} RSS articles processed and stored in memory only`
    );

    const firstBatch = processedRssData.slice(0, 4);
    setDisplayedRssNews(firstBatch);
    setRssLoadCount(4);
    setIsLoadingMore(false);
  };

  // Store articles when they're loaded/updated (memory only)
  useEffect(() => {
    if (featuredStocks.length > 0) {
      featuredStocks.forEach((article) => {
        if (!articleStorage[article.id]) {
          storeArticle(article, false);
        }
      });
    }
  }, [featuredStocks]);

  useEffect(() => {
    if (latestMarketNews.length > 0) {
      latestMarketNews.forEach((article) => {
        if (!articleStorage[article.id]) {
          storeArticle(article, false);
        }
      });
    }
  }, [latestMarketNews]);

  useEffect(() => {
    if (displayedRssNews.length > 0) {
      displayedRssNews.forEach((article) => {
        if (!articleStorage[article.id]) {
          storeArticle(article, true);
        }
      });
    }
  }, [displayedRssNews]);

  // Simplified refreshNews function - no localStorage operations
  const refreshNews = () => {
    console.log("🔄 Refreshing news...");
    setIsLoading(true);
    setFeaturedStocks([]);
    setLatestMarketNews([]);
    setRssNewsData([]);
    setDisplayedRssNews([]);
    setDisplayCount(6);
    setRssLoadCount(0);
    setHasLoadedRss(false);
    setArticleStorage({});

    console.log("🔄 All data cleared from memory");
    console.log("🔄 API data will be refreshed via ShareMarketApi component");
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center">
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-300 shadow-lg hover:shadow-blue-500/30 w-full"
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

  const getFilteredMarketNews = () => {
    return latestMarketNews.filter(
      (content) =>
        activeCategory === "all" ||
        (activeCategory === "stocks" && content.subcategory === "Stocks") ||
        (activeCategory === "crypto" &&
          content.subcategory === "Cryptocurrency")
    );
  };

  const renderRssNewsCard = (content) => {
    return (
      <BotherCards
        key={content.id}
        id={content.id}
        title={content.title}
        description={content.summary || content.description}
        image={content.image}
        date={content.date}
        isExpanded={expandedArticles[`rss_${content.id}`]}
        onReadMore={() => handleReadMoreClick(content, "rss")}
        fallbackImageCategory="news"
        maxWords={50}
      />
    );
  };

  return (
    <div className="bg-white min-h-screen text-white">
      <ShareMarketApi onDataLoaded={handleDataLoaded} />
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
          {/* Hero Section - ONLY LATEST DATA */}
          <section className="relative overflow-hidden bg-white">
            <div className="bg-white text-black py-10 px-6 lg:px-10">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <FiTrendingUp className="mr-2 text-green-300" />
                      <span className="text-sm font-medium">
                        MARKET PULSE - LATEST
                      </span>
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

                {/* Featured Stocks Grid - LATEST ONLY */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featuredStocks.map((stock, index) => (
                    <BheroCards
                      key={stock.id}
                      stock={stock}
                      index={index}
                      categoryIcons={categoryIcons}
                      onStoreArticle={storeArticle}
                      maxWords={50}
                    />
                  ))}
                </div>

                {featuredStocks.length > 0 && (
                  <div className="mt-4 text-center">
                    {/* <p className="text-sm text-gray-600">
                      🕒 Last updated: {new Date().toLocaleString()} | Next
                      update in:{" "}
                      {Math.ceil((900000 - (Date.now() % 900000)) / 60000)}{" "}
                      minutes
                    </p> */}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Slider Section - Now handled by Bslider component itself */}
          <section className="bg-white py-6">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <Bslider onArticleStore={storeArticle} />
            </div>
          </section>

          {/* Main Content - Latest Market News */}
          <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 bg-white">
            <div className="space-y-6 bg-white">
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
                    onReadMore={() => handleReadMoreClick(content, "api")}
                    fallbackImageCategory={
                      content.subcategory?.toLowerCase() || "finance"
                    }
                    maxWords={50}
                  />
                ))}

              {displayedRssNews.map((content) => renderRssNewsCard(content))}

              {(getFilteredMarketNews().length > displayCount ||
                rssLoadCount < rssNewsData.length ||
                !hasLoadedRss) && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreContent}
                    disabled={isLoadingMore}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center group disabled:cursor-not-allowed"
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

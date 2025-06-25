import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to strip HTML tags
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Function to truncate text
  const truncateText = (text, limit = 150) => {
    const cleanText = stripHtml(text);
    if (cleanText.length <= limit) return cleanText;
    return cleanText.substring(0, limit) + '...';
  };

  // Get article image URL
  const getArticleImage = (article) => {
    return article.image || 
           article.urlToImage || 
           article.imgUrl || 
           article.thumbnail || 
           '/placeholder-news.jpg';
  };

  useEffect(() => {
    const query = searchParams.get('q')?.toLowerCase().trim();
    console.log('🔍 Search query:', query);

    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Get all possible storage locations
    const storageKeys = [
      // Homepage categories
      'newsData',
      'politicsData',
      'businessData',
      'technologyData',
      'healthData',
      'sportsData',
      'entertainmentData',
      
      // Business page categories
      'shareMarketData',
      'marketData',
      'latestData',
      
      // Individual articles
      ...getIndividualArticleKeys()
    ];

    let allArticles = [];

    // Load data from all sources
    storageKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const items = JSON.parse(data);
          // Normalize data to array format
          const articles = Array.isArray(items) ? items : [items];
          allArticles = [...allArticles, ...articles];
        } catch (error) {
          console.error(`❌ Error parsing ${key}:`, error);
        }
      }
    });

    // Filter and deduplicate results
    const filtered = allArticles
      .filter(article => article && matchesSearch(article, query))
      .filter((article, index, self) => 
        index === self.findIndex(a => a.id === article.id)
      );

    setResults(filtered);
    setIsLoading(false);
  }, [searchParams]);

  // Helper to get all individual article keys
  const getIndividualArticleKeys = () => {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('article_'));
  };

  // Improved search matching function
  const matchesSearch = (article, query) => {
    if (!article) return false;
    
    const searchText = [
      article.title,
      article.headline,
      article.description,
      article.summary,
      // Handle HTML content by stripping tags before searching
      stripHtml(article.content || ''),
      // Handle both object and array content formats
      ...(typeof article.content === 'string' ? [] : []),
      ...(Array.isArray(article.content) ? 
        article.content.map(c => stripHtml(c.text || '')) : []),
      ...(typeof article.content?.text === 'string' ? 
        [stripHtml(article.content.text)] : [])
    ]
      .filter(Boolean) // Remove empty fields
      .join(' ')       // Combine into one string
      .toLowerCase();  // Case-insensitive search
    
    return searchText.includes(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Search Results</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try searching for something else or check your spelling.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {results.map((article, idx) => (
              <article key={idx} className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 h-48 overflow-hidden">
                  <img
                    className="h-full w-full object-cover"
                    src={getArticleImage(article)}
                    alt={article.title || 'News article'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-news.jpg';
                    }}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600">
                      {article.category || 'General News'}
                    </p>
                    <a href={`/article/${article.id}`} className="mt-2 block">
                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                        {article.title || 'Untitled Article'}
                      </h3>
                      <p className="mt-3 text-base text-gray-500 line-clamp-3">
                        {truncateText(
                          article.description || 
                          article.summary || 
                          article.content || 
                          'No description available'
                        )}
                      </p>
                    </a>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">{article.source?.name || 'Unknown source'}</span>
                      {article.source?.logo && (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={article.source.logo}
                          alt={article.source.name}
                        />
                      )}
                    </div>
                    {/* <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {article.source?.name || 'Unknown source'}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={article.publishedAt || article.date}>
                          {new Date(article.publishedAt || article.date).toLocaleDateString()}
                        </time>
                        <span aria-hidden="true">&middot;</span>
                        <span>{article.author || 'Unknown author'}</span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    return article.image_url || 
           article.image || 
           article.urlToImage || 
           article.imgUrl || 
           article.thumbnail || 
           '/placeholder-news.jpg';
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  // Format category array or string
  const formatCategory = (category) => {
    if (!category) return 'General News';
    if (Array.isArray(category)) {
      return category.join(', ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Search in localStorage
  const searchLocalStorage = (query) => {
    try {
      const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
      if (!Array.isArray(savedArticles)) return [];
      
      const lowerQuery = query.toLowerCase();
      return savedArticles.filter(article => {
        const title = article.title?.toLowerCase() || '';
        const description = article.description?.toLowerCase() || '';
        const content = article.content?.toLowerCase() || '';
        
        return title.includes(lowerQuery) || 
               description.includes(lowerQuery) || 
               content.includes(lowerQuery);
      });
    } catch (err) {
      console.error('Error searching localStorage:', err);
      return [];
    }
  };

  useEffect(() => {
    const query = searchParams.get('q')?.trim();
    console.log('🔍 Search query:', query);

    if (!query) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Search from API
        const apiResponse = await fetch(`${BASE_URL}/api/news/search?q=${encodeURIComponent(query)}`);
        
        if (!apiResponse.ok) {
          throw new Error(`HTTP error! status: ${apiResponse.status}`);
        }

        const apiData = await apiResponse.json();
        
        // Search from localStorage
        const localResults = searchLocalStorage(query);
        
        // Combine results, removing duplicates by article URL or ID
        const combinedResults = [...apiData, ...localResults];
        const uniqueResults = combinedResults.reduce((acc, current) => {
          const x = acc.find(item => 
            (item.url && item.url === current.url) || 
            (item.id && item.id === current.id)
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        console.log('📊 Combined search results:', uniqueResults);
        setResults(uniqueResults || []);
        
      } catch (err) {
        console.error('❌ Search error:', err);
        
        // Fallback to localStorage if API fails
        const localResults = searchLocalStorage(query);
        if (localResults.length > 0) {
          setResults(localResults);
          setError('Could not connect to server. Showing locally saved results only.');
        } else {
          setError('Failed to search articles. Please try again.');
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);

  const query = searchParams.get('q') || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results</h1>
          {query && (
            <p className="text-gray-600">
              Showing results for: <span className="font-semibold">"{query}"</span>
              {!isLoading && results.length > 0 && (
                <span className="ml-2 text-sm">({results.length} articles found)</span>
              )}
            </p>
          )}
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              <span className="text-gray-600">Searching articles...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && !error && results.length === 0 && query && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any articles matching "{query}".
            </p>
            <div className="text-sm text-gray-500">
              <p>Try:</p>
              <ul className="mt-2 space-y-1">
                <li>• Using different keywords</li>
                <li>• Checking your spelling</li>
                <li>• Using more general terms</li>
              </ul>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !error && results.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <article 
                key={article.id || article.url} 
                className="flex flex-col overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 hover:border-gray-200"
              >
                {/* Article Image */}
                <div className="flex-shrink-0 h-48 overflow-hidden bg-gray-100">
                  <img
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    src={getArticleImage(article)}
                    alt={article.title || 'News article'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-news.jpg';
                    }}
                  />
                </div>

                {/* Article Content */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Category */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {formatCategory(article.category)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-red-700 transition-colors">
                    <a 
                      href={article.link || article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {article.title || 'Untitled Article'}
                    </a>
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-4">
                    {truncateText(
                      article.description || 
                      article.summary || 
                      article.content ||
                      'No description available'
                    )}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <time 
                      className="text-xs text-gray-500"
                      dateTime={article.created_at || article.publishedAt}
                    >
                      {formatDate(article.created_at || article.publishedAt)}
                    </time>
                    
                    <a 
                      href={article.link || article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline transition-colors"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Back to Home Link */}
        {!isLoading && (
          <div className="mt-12 text-center">
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              ← Back to Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
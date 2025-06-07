import React, { useEffect, useState } from 'react';
import { Query } from 'appwrite';
import { databases, storage } from '../appwrite/appwriteConfig';
import conf from '../conf/conf';
import { 
  RefreshCw, 
  Clock, 
  ArrowRight, 
  Newspaper, 
  TrendingUp,
  Eye,
  User,
  Calendar,
  Hash,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';

const LatestNews = ({ onNavigateToArticle }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState({});

  // Updated function to get image URL using the same method as ArticleDetailPage
  const getImageUrl = (imageId) => {
    try {
      if (!imageId) {
        return null;
      }
      
      // If it's already a URL, return it
      if (typeof imageId === 'string' && imageId.startsWith('http')) {
        return imageId;
      }
      
      // Handle object type
      if (typeof imageId === 'object' && imageId !== null) {
        return imageId.url || imageId.src || imageId.href || null;
      }
      
      // Use Appwrite storage.getFileView (same as ArticleDetailPage)
      if (imageId && conf.appwriteBucketId) {
        try {
          const viewUrl = storage.getFileView(conf.appwriteBucketId, imageId);
          if (typeof viewUrl === 'string') return viewUrl;
          if (viewUrl?.href) return viewUrl.href;
          return viewUrl?.toString() || null;
        } catch (error) {
          console.error('Error generating Appwrite URL:', error);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in getImageUrl:', error);
      return null;
    }
  };

  const fetchNews = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      const response = await databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      
      console.log("✅ News fetched:", response.documents);
      setNews(response.documents);
    } catch (error) {
      console.error('❌ Error fetching news:', error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    fetchNews(true);
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getWordCount = (content) => {
    if (!content) return 0;
    return stripHtml(content).split(' ').filter(word => word.length > 0).length;
  };

  const truncateContent = (content, limit = 50) => {
    if (!content) return '';
    const plainText = stripHtml(content);
    const words = plainText.split(' ');
    if (words.length <= limit) return plainText;
    return words.slice(0, limit).join(' ') + '...';
  };

  const handleReadMore = (article) => {
    const wordCount = getWordCount(article.content);
    
    // ALWAYS store article data in localStorage, regardless of word count
    try {
      localStorage.setItem(`article_${article.$id}`, JSON.stringify(article));
      console.log(`✅ Article ${article.$id} stored in localStorage`);
    } catch (error) {
      console.error('❌ Error storing article in localStorage:', error);
    }
    
    if (wordCount > 50) {
      // For longer articles, navigate to detail page
      if (onNavigateToArticle) {
        onNavigateToArticle(article.$id);
      } else {
        // Fallback: redirect using window.location
        window.location.href = `/article/${article.$id}`;
      }
    } else {
      // For shorter articles, you can still navigate to detail page
      // or toggle expansion - your choice
      if (onNavigateToArticle) {
        onNavigateToArticle(article.$id);
      } else {
        // Alternative: toggle expansion in-place for short articles
        setExpandedArticles(prev => ({
          ...prev,
          [article.$id]: !prev[article.$id]
        }));
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadingTime = (content) => {
    const wordCount = getWordCount(content);
    return Math.ceil(wordCount / 200) || 1;
  };

  // Helper function to get article image (same logic as ArticleDetailPage)
  const getArticleImage = (article) => {
    if (!article) return null;
    const imageField = article.featuredimage || article.image || article.thumbnail;
    if (typeof imageField === 'object' && imageField !== null) {
      return imageField.url || imageField.src || imageField.href || null;
    }
    return imageField;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            <Newspaper className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Latest News</h2>
          <p className="text-gray-400">Fetching the most recent updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-white">
      {/* News Cards Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-2">
              <span className="text-gray-900">Breaking</span>{' '}
              <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">Stories</span>
            </h2>
            <p className="text-gray-400 text-lg">Real-time news updates and comprehensive coverage</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-400">{news.length}</div>
            <div className="text-gray-500 text-sm uppercase tracking-wide">
              {news.length === 1 ? 'Article' : 'Articles'} Available
            </div>
          </div>
        </div>

        {news.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
                <Newspaper className="text-gray-600" size={64} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <Eye className="text-white" size={16} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-300 mb-4">No News Available</h3>
            <p className="text-gray-500 text-lg mb-8">We're working to bring you the latest updates</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <RefreshCw size={20} />
              Check for Updates
            </button>
          </div>
        ) : (
          // News Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article, index) => {
              const wordCount = getWordCount(article.content);
              const shouldTruncate = wordCount > 50;
              const isExpanded = expandedArticles[article.$id];
              const readingTime = getReadingTime(article.content);
              
              // Get image URL using the same method as ArticleDetailPage
              const articleImage = getArticleImage(article);
              const imageUrl = getImageUrl(articleImage);
              
              console.log('Article:', article.title, 'Image field:', articleImage, 'Final URL:', imageUrl);
              
              return (
                <article
                  key={article.$id}
                  className="group bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden shadow-2xl relative"
                >
                  {/* Featured Image */}
                  <div className="relative h-56 bg-gray-800 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={article.title || 'Article image'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', imageUrl);
                        }}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', imageUrl);
                          console.error('Error details:', {
                            articleImage: articleImage,
                            bucketId: conf.appwriteBucketId,
                            fullUrl: imageUrl
                          });
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.fallback-placeholder').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback placeholder */}
                    <div 
                      className={`fallback-placeholder absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}
                    >
                      <div className="text-center">
                        <ImageIcon className="text-gray-500 mb-2 mx-auto" size={48} />
                        <p className="text-gray-400 text-sm">No Image Available</p>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    {article.category && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {article.category}
                        </span>
                      </div>
                    )}

                    {/* Breaking Badge for first article */}
                    {index === 0 && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                          🔴 Breaking
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 
                      className="text-xl font-bold text-white mb-4 line-clamp-2 hover:text-red-400 transition-colors cursor-pointer group-hover:text-red-300"
                      onClick={() => handleReadMore(article)}
                    >
                      {article.title}
                    </h3>
                    
                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-gray-400 text-sm mb-4 pb-4 border-b border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(article.$createdAt)}</span>
                        </div>
                      </div>
                      {article.author && (
                        <div className="flex items-center gap-1 text-red-400">
                          <User size={14} />
                          <span>{article.author}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Preview */}
                    <div className="text-gray-300 mb-6 leading-relaxed">
                      {shouldTruncate && !isExpanded && wordCount <= 50 ? (
                        <p className="text-sm">{truncateContent(article.content)}</p>
                      ) : wordCount <= 50 && isExpanded ? (
                        <div 
                          className="text-sm prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: article.content }} 
                        />
                      ) : (
                        <p className="text-sm">{truncateContent(article.content)}</p>
                      )}
                    </div>
                    
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {article.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="flex items-center gap-1 bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs hover:bg-gray-700 transition-colors">
                            <Hash size={10} />
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full text-xs">
                            +{article.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      {/* Read More Button */}
                      <button
                        onClick={() => handleReadMore(article)}
                        className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold text-sm transition-all duration-300 group/btn"
                      >
                        <BookOpen size={16} />
                        <span>Read Full Article</span>
                        <ArrowRight 
                          size={16} 
                          className="transform group-hover/btn:translate-x-1 transition-transform" 
                        />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestNews;
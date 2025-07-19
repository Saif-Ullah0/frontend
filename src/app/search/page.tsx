// app/search/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Users, 
  Clock, 
  BookOpen,
  TrendingUp,
  Heart,
  ArrowRight,
  ChevronRight,
  X
} from 'lucide-react';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: {
    name: string;
  };
  rating?: number;
  studentsCount?: number;
  duration?: string;
  level?: string;
  instructor?: string;
  thumbnail?: string;
};

type SearchSuggestion = {
  id: string;
  text: string;
  type: 'course' | 'category' | 'instructor';
  count?: number;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Popular search terms
  const popularSearches = [
    'JavaScript', 'Python', 'React', 'Machine Learning', 'Web Development',
    'Data Science', 'UI/UX Design', 'Digital Marketing', 'Cloud Computing'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // If there's an initial query, perform the search
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    // Generate suggestions when query changes
    // if (query.length > 1) {
    //   const mockSuggestions: SearchSuggestion[] = [
    //     { id: '1', text: `${query} for beginners`, type: 'course', count: 15 },
    //     { id: '2', text: `Advanced ${query}`, type: 'course', count: 8 },
    //     { id: '3', text: `${query} fundamentals`, type: 'course', count: 22 },
    //     { id: '4', text: `${query} category`, type: 'category', count: 5 },
    //     { id: '5', text: `Prof. ${query} instructor`, type: 'instructor', count: 3 },
    //   ].filter(s => s.text.toLowerCase().includes(query.toLowerCase()));
      
    //   setSuggestions(mockSuggestions);
    //   setShowSuggestions(true);
    // } else {
      setSuggestions([]);
      setShowSuggestions(false);
  //  }
  }, [query]);

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setShowSuggestions(false);
    
    try {
      const res = await fetch(`http://localhost:5000/api/courses/search?query=${searchQuery}`);
      const data = await res.json();
      
      // Enhance results with mock data
      const enhancedResults = data.map((course: Course) => ({
        ...course,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        studentsCount: Math.floor(Math.random() * 5000) + 100,
        duration: `${Math.floor(Math.random() * 20) + 5}h`,
        level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        instructor: ['Dr. Sarah Johnson', 'Prof. Mike Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Wang'][Math.floor(Math.random() * 5)],
        thumbnail: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400&h=250&fit=crop`
      }));
      
      setResults(enhancedResults);
      saveRecentSearch(searchQuery);
      
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('q', searchQuery);
      router.replace(url.pathname + url.search);
      
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    performSearch(suggestion.text);
  };

  const handlePopularSearchClick = (term: string) => {
    setQuery(term);
    performSearch(term);
  };

  const filteredResults = results.filter(course => {
    const matchesLevel = filterLevel === 'all' || course.level?.toLowerCase() === filterLevel;
    const matchesPrice = filterPrice === 'all' || 
                        (filterPrice === 'free' && course.price === 0) ||
                        (filterPrice === 'paid' && course.price > 0);
    const matchesCategory = filterCategory === 'all' || course.category.name.toLowerCase().includes(filterCategory.toLowerCase());
    
    return matchesLevel && matchesPrice && matchesCategory;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'students':
        return (b.studentsCount || 0) - (a.studentsCount || 0);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return b.id - a.id;
      default: // relevance
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-200 mb-4">
              Search Courses
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Find the perfect course to advance your skills and career
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-8">
            <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search by course title, category, or instructor..."
                  className="w-full pl-14 pr-32 py-4 text-lg rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          suggestion.type === 'course' ? 'bg-blue-400' :
                          suggestion.type === 'category' ? 'bg-green-400' : 'bg-purple-400'
                        }`}></div>
                        <span className="text-white group-hover:text-blue-300">{suggestion.text}</span>
                      </div>
                      {suggestion.count && (
                        <span className="text-xs text-gray-400">{suggestion.count} results</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Recent and Popular Searches */}
            {!searched && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handlePopularSearchClick(search)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-300 flex items-center gap-2"
                        >
                          {search}
                          <X 
                            className="w-3 h-3 hover:text-red-400" 
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = recentSearches.filter((_, i) => i !== index);
                              setRecentSearches(updated);
                              localStorage.setItem('recentSearches', JSON.stringify(updated));
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handlePopularSearchClick(search)}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-300"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Searching for &quot;{query}&quot;...</p>
            </div>
          )}

          {!loading && searched && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Search Results for &quot;{query}&quot;
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {sortedResults.length} {sortedResults.length === 1 ? 'course' : 'courses'} found
                  </p>
                </div>

                {results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          viewMode === 'grid' ? 'bg-purple-500/30 text-purple-400' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          viewMode === 'list' ? 'bg-purple-500/30 text-purple-400' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filters */}
              {results.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl mb-8">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Filters:</span>
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                    >
                      <option value="relevance" className="bg-gray-900">Most Relevant</option>
                      <option value="rating" className="bg-gray-900">Highest Rated</option>
                      <option value="students" className="bg-gray-900">Most Popular</option>
                      <option value="price-low" className="bg-gray-900">Price: Low to High</option>
                      <option value="price-high" className="bg-gray-900">Price: High to Low</option>
                      <option value="newest" className="bg-gray-900">Newest</option>
                    </select>

                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                    >
                      <option value="all" className="bg-gray-900">All Levels</option>
                      <option value="beginner" className="bg-gray-900">Beginner</option>
                      <option value="intermediate" className="bg-gray-900">Intermediate</option>
                      <option value="advanced" className="bg-gray-900">Advanced</option>
                    </select>

                    <select
                      value={filterPrice}
                      onChange={(e) => setFilterPrice(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                    >
                      <option value="all" className="bg-gray-900">All Prices</option>
                      <option value="free" className="bg-gray-900">Free</option>
                      <option value="paid" className="bg-gray-900">Paid</option>
                    </select>

                    <div className="ml-auto text-sm text-gray-400">
                      Showing {sortedResults.length} of {results.length} results
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {sortedResults.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {sortedResults.map((course, index) => (
                    viewMode === 'grid' ? (
                      // Grid View - Same as category page
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="group bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
                              {course.level}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-300">{course.rating}</span>
                            </div>
                          </div>
                          <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors cursor-pointer" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {course.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.studentsCount?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.category.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {course.price === 0 ? 'Free' : `$${course.price}`}
                            </p>
                            <p className="text-xs text-gray-400">by {course.instructor}</p>
                          </div>
                          <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300">
                            <span className="text-sm font-medium">View Course</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    ) : (
                      // List View - Same as category page
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="group bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-purple-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                                {course.title}
                              </h3>
                              <div className="flex items-center gap-2 ml-4">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-300">{course.rating}</span>
                                </div>
                                <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors cursor-pointer" />
                              </div>
                            </div>
                            
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                              {course.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6 text-xs text-gray-400">
                                <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">{course.level}</span>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{course.studentsCount?.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.duration}</span>
                                </div>
                                <span>{course.category.name}</span>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-xl font-bold text-white">
                                  {course.price === 0 ? 'Free' : `$${course.price}`}
                                </p>
                                <p className="text-xs text-gray-400">by {course.instructor}</p>
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-300 mb-4">No courses found</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    We could not find any courses matching &quot;{query}&quot;. Try different keywords or browse our categories.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setQuery('');
                        setSearched(false);
                        setResults([]);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 mr-4"
                    >
                      Try New Search
                    </button>
                    <Link
                      href="/categories"
                      className="bg-white/10 border border-white/20 hover:bg-white/20 px-6 py-3 rounded-xl transition-all duration-300 inline-block"
                    >
                      Browse Categories
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Filter className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-300 mb-4">No courses match your filters</h3>
                  <p className="text-gray-400 mb-8">Try adjusting your filter criteria to see more results.</p>
                  <button
                    onClick={() => {
                      setFilterLevel('all');
                      setFilterPrice('all');
                      setFilterCategory('all');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </main>
  );
}
// app/categories/page.tsx
'use client';

import { useEffect, useState } from 'react';
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
  Award,
  Zap,
  ChevronRight,
  ArrowRight,
  Heart,
  Play,
  Plus
} from 'lucide-react';

type Category = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  coursesCount?: number;
  color?: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: {
    name: string;
  };
  rating?: number;
  studentsCount?: number;
  duration?: string;
  level?: string;
  instructor?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories/public');
        const data = await res.json();
        
        // Add mock data for better presentation
        const enhancedCategories = data.map((cat: Category, index: number) => ({
          ...cat,
          coursesCount: Math.floor(Math.random() * 50) + 10,
          color: [
            'from-blue-500 to-purple-500',
            'from-green-500 to-teal-500', 
            'from-orange-500 to-red-500',
            'from-purple-500 to-pink-500',
            'from-cyan-500 to-blue-500',
            'from-yellow-500 to-orange-500'
          ][index % 6]
        }));
        
        setCategories(enhancedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/search?query=${searchQuery}`);
      const data = await res.json();
      
      // Add mock data for better presentation
      const enhancedResults = data.map((course: Course) => ({
        ...course,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
        studentsCount: Math.floor(Math.random() * 5000) + 100,
        duration: `${Math.floor(Math.random() * 20) + 5}h`,
        level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        instructor: ['Dr. Sarah Johnson', 'Prof. Mike Chen', 'Emily Rodriguez', 'David Kim'][Math.floor(Math.random() * 4)]
      }));
      
      setSearchResults(enhancedResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-[200px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 mb-4 drop-shadow-lg">
              Discover Amazing Courses
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore our diverse categories and find the perfect course to advance your skills
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for courses, topics, or instructors..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Search
                      </>
                    )}
                  </button>
                  
                  {searchResults !== null && (
                    <button
                      onClick={clearSearch}
                      className="px-6 py-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl transition-all duration-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Search Filters */}
              {searchResults !== null && (
                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Filters:</span>
                  </div>
                  
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                  >
                    <option value="all" className="bg-gray-900">All Levels</option>
                    <option value="beginner" className="bg-gray-900">Beginner</option>
                    <option value="intermediate" className="bg-gray-900">Intermediate</option>
                    <option value="advanced" className="bg-gray-900">Advanced</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                  >
                    <option value="relevance" className="bg-gray-900">Most Relevant</option>
                    <option value="rating" className="bg-gray-900">Highest Rated</option>
                    <option value="students" className="bg-gray-900">Most Popular</option>
                    <option value="price" className="bg-gray-900">Price: Low to High</option>
                  </select>

                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1 ml-auto">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        viewMode === 'grid' ? 'bg-blue-500/30 text-blue-400' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        viewMode === 'list' ? 'bg-blue-500/30 text-blue-400' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results or Categories */}
          {searchResults !== null ? (
            // Search Results
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Search Results for "{searchQuery}"
                </h2>
                <span className="text-gray-400">
                  {searchResults.length} courses found
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-20 h-20 text-gray-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-300 mb-4">No courses found</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Try searching with different keywords or browse our categories below
                  </p>
                  <button
                    onClick={clearSearch}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Browse Categories
                  </button>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {searchResults.map((course) => (
                    viewMode === 'grid' ? (
                      // Grid View
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="group bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300 font-medium">
                              {course.level}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-300">{course.rating}</span>
                            </div>
                          </div>
                          <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors cursor-pointer" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
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
                          <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300">
                            <span className="text-sm font-medium">View Course</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    ) : (
                      // List View
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="group bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-blue-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
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
                                <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-300">{course.level}</span>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{course.studentsCount?.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.duration}</span>
                                </div>
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
              )}
            </div>
          ) : (
            // Categories Display
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Browse by Category</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <TrendingUp className="w-5 h-5" />
                  <span>{categories.length} categories available</span>
                </div>
              </div>

              {categoriesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                      <div className="w-full h-36 bg-white/10 rounded-xl mb-4"></div>
                      <div className="h-6 bg-white/10 rounded mb-2"></div>
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((category, index) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.id}`}
                      className="group bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative overflow-hidden rounded-xl mb-4">
                        <img
                          src={category.imageUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&crop=center`}
                          alt={category.name}
                          className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                        <div className="absolute top-3 right-3">
                          <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white">
                            {category.coursesCount} courses
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <BookOpen className="w-4 h-4" />
                          <span>{category.coursesCount} courses</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 group-hover:text-blue-300">
                          <span className="text-sm font-medium">Explore</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Featured Section */}
              <div className="mt-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-4">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Can't find what you're looking for?</h3>
                  <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                    Our course catalog is constantly growing. Use our search feature to find specific topics or reach out to suggest new courses.
                  </p>
                  <button
                    onClick={() => document.querySelector('input')?.focus()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
                  >
                    <Search className="w-5 h-5" />
                    Try Advanced Search
                  </button>
                </div>
              </div>
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
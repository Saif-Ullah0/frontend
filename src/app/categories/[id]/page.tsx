// app/categories/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  Search,
  Grid3X3, 
  List,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
};

type Category = {
  id: number;
  name: string;
  description: string;
  courses: Course[];
  imageUrl?: string;
};

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [filterPrice, setFilterPrice] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/categories/${id}`);
        if (!res.ok) throw new Error('Category not found');
        const data = await res.json();
        setCategory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategory();
  }, [id]);

  const filteredCourses = category?.courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = filterPrice === 'all' || 
                        (filterPrice === 'free' && course.price === 0) ||
                        (filterPrice === 'paid' && course.price > 0);
    
    return matchesSearch && matchesPrice;
  }) || [];

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return a.id - b.id;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-xl">Loading category...</span>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-red-500/20 to-pink-500/20 blur-[150px] rounded-full animate-pulse-slow"></div>
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <Search className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Category Not Found</h1>
          <p className="text-gray-300 mb-8">The category you are looking for does not exist or has been moved.</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/categories')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 w-full"
            >
              Browse All Categories
            </button>
            <button
              onClick={() => router.back()}
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 w-full"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/categories')}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">{category.name}</h1>
                <p className="text-gray-400 text-sm">{category.courses.length} courses available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Category Header */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-8 relative overflow-hidden">
            {category.imageUrl && (
              <div className="absolute inset-0 opacity-10">
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-4">
                    {category.name}
                  </h2>
                  <p className="text-gray-300 text-lg mb-6 max-w-3xl">{category.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mx-auto mb-2">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{category.courses.length}</div>
                      <div className="text-sm text-gray-400">Total Courses</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mx-auto mb-2">
                        <BookOpen className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {category.courses.filter(c => c.price === 0).length}
                      </div>
                      <div className="text-sm text-gray-400">Free Courses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* Filters */}
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value="all" className="bg-gray-900">All Prices</option>
                  <option value="free" className="bg-gray-900">Free</option>
                  <option value="paid" className="bg-gray-900">Paid</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  <option value="title" className="bg-gray-900">Alphabetical</option>
                  <option value="price-low" className="bg-gray-900">Price: Low to High</option>
                  <option value="price-high" className="bg-gray-900">Price: High to Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm mr-2">{sortedCourses.length} courses</span>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' ? 'bg-blue-500/30 text-blue-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' ? 'bg-blue-500/30 text-blue-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {sortedCourses.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-300 mb-4">No courses found</h3>
              <p className="text-gray-400 mb-8">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterPrice('all');
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {sortedCourses.map((course, index) => (
                viewMode === 'grid' ? (
                  // Grid View
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {course.price === 0 ? 'Free' : `${course.price}`}
                        </p>
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
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-blue-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1 mb-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-white">
                            {course.price === 0 ? 'Free' : `${course.price}`}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                )
              ))}
            </div>
          )}

          {/* Back to Categories */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
              <h3 className="text-2xl font-bold text-white mb-4">Explore More Categories</h3>
              <p className="text-gray-400 mb-6">
                Discover other course categories and expand your learning horizons
              </p>
              <button
                onClick={() => router.push('/categories')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <BookOpen className="w-5 h-5" />
                Browse All Categories
              </button>
            </div>
          </div>
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
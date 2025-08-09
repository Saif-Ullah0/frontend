"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TagIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FireIcon,
  StarIcon,
  GlobeAltIcon,
  ShoppingCartIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  totalPrice: number;
  finalPrice: number;
  discount: number;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isPublic: boolean;
  salesCount: number;
  revenue: number;
  viewCount: number;
  totalItems: number;
  individualTotal: number;
  savings: number;
  savingsPercentage: number;
  canEdit: boolean;
  canDelete: boolean;
  isOwner: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  moduleItems?: Array<{
    module: {
      id: number;
      title: string;
      price: number;
      duration?: number;
      course: { 
        id: number;
        title: string; 
        category: { name: string };
      };
    };
  }>;
  courseItems?: Array<{
    course: {
      id: number;
      title: string;
      price: number;
      imageUrl?: string;
      category: { name: string };
      modules: Array<{ 
        id: number; 
        title: string; 
        duration?: number; 
      }>;
    };
  }>;
  createdAt: string;
}

interface MarketplaceStats {
  totalBundles: number;
  featuredBundles: number;
  popularBundles: number;
  totalSavings: number;
  averageDiscount: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
}

type FilterType = 'all' | 'MODULE' | 'COURSE';
type FilterStatus = 'all' | 'featured' | 'popular';
type SortBy = 'newest' | 'popular' | 'savings' | 'price-low' | 'price-high' | 'name';

export default function BundleMarketplace() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [featuredBundles, setFeaturedBundles] = useState<Bundle[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minSavings, setMinSavings] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const fetchBundles = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        view: 'marketplace',
        type: filterType,
        featured: filterStatus === 'featured' ? 'true' : 'false',
        popular: filterStatus === 'popular' ? 'true' : 'false',
        sort: sortBy,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm
      });

      const response = await fetch(`http://localhost:5000/api/bundles?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🛒 Marketplace Bundles:', data);
        setBundles(data.bundles || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch bundles:', errorData);
        toast.error('Failed to load bundles');
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load bundles');
    }
  }, [filterType, filterStatus, sortBy, currentPage, itemsPerPage, searchTerm]);

  const fetchFeaturedBundles = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bundles/featured?limit=6', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('⭐ Featured Bundles:', data);
        setFeaturedBundles(data.featuredBundles || []);
      }
    } catch (error) {
      console.error('Error fetching featured bundles:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      // This would be a new endpoint for marketplace stats
      const mockStats: MarketplaceStats = {
        totalBundles: bundles.length,
        featuredBundles: bundles.filter(b => b.isFeatured).length,
        popularBundles: bundles.filter(b => b.isPopular).length,
        totalSavings: bundles.reduce((sum, b) => sum + b.savings, 0),
        averageDiscount: bundles.length > 0 
          ? bundles.reduce((sum, b) => sum + b.savingsPercentage, 0) / bundles.length 
          : 0,
        categories: Array.from(
          new Set(
            bundles.flatMap(bundle => 
              bundle.type === 'COURSE' 
                ? bundle.courseItems?.map(item => item.course.category.name) || []
                : bundle.moduleItems?.map(item => item.module.course.category.name) || []
            )
          )
        ).map(name => ({
          name,
          count: bundles.filter(bundle => 
            bundle.type === 'COURSE' 
              ? bundle.courseItems?.some(item => item.course.category.name === name)
              : bundle.moduleItems?.some(item => item.module.course.category.name === name)
          ).length
        }))
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, [bundles]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBundles(), fetchFeaturedBundles()]);
      setLoading(false);
    };
    loadData();
  }, [fetchBundles, fetchFeaturedBundles]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Apply client-side filtering
  const filteredBundles = bundles.filter(bundle => {
    // Category filter
    if (selectedCategory !== 'all') {
      const hasCategory = bundle.type === 'COURSE' 
        ? bundle.courseItems?.some(item => item.course.category.name === selectedCategory)
        : bundle.moduleItems?.some(item => item.module.course.category.name === selectedCategory);
      if (!hasCategory) return false;
    }

    // Price range filter
    if (bundle.finalPrice < priceRange[0] || bundle.finalPrice > priceRange[1]) {
      return false;
    }

    // Minimum savings filter
    if (bundle.savingsPercentage < minSavings) {
      return false;
    }

    return true;
  });

  const handlePurchaseBundle = async (bundleId: number) => {
    setPurchaseLoading(bundleId);
    
    try {
      const response = await fetch('http://localhost:5000/api/bundles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(data.message || data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Something went wrong');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setSortBy('popular');
    setSelectedCategory('all');
    setPriceRange([0, 500]);
    setMinSavings(0);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading bundle marketplace...</span>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage);
  const paginatedBundles = filteredBundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Bundle Marketplace</h1>
              <p className="text-gray-400 text-lg">Save big with curated learning bundles from top instructors</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/bundles"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                Create Bundle
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Bundles</p>
                    <p className="text-2xl font-bold text-white">{stats.totalBundles}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <SparklesIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Featured</p>
                    <p className="text-2xl font-bold text-white">{stats.featuredBundles}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <FireIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Popular</p>
                    <p className="text-2xl font-bold text-white">{stats.popularBundles}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Savings</p>
                    <p className="text-2xl font-bold text-white">${stats.totalSavings.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <ChartBarIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Avg Discount</p>
                    <p className="text-2xl font-bold text-white">{Math.round(stats.averageDiscount)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Bundles Section */}
        {featuredBundles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">Featured Bundles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBundles.slice(0, 3).map((bundle) => (
                <div
                  key={bundle.id}
                  className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-3xl p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                          Featured
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {bundle.type} Bundle
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="text-gray-400 text-sm line-clamp-2">{bundle.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{bundle.totalItems}</p>
                      <p className="text-xs text-gray-400">Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-400">{bundle.salesCount}</p>
                      <p className="text-xs text-gray-400">Sales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-400">{bundle.savingsPercentage}%</p>
                      <p className="text-xs text-gray-400">Off</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4 p-4 bg-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                      <span className="text-gray-400 line-through">${bundle.individualTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-green-400 font-medium text-sm">
                      Save ${bundle.savings.toFixed(2)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePurchaseBundle(bundle.id)}
                      disabled={purchaseLoading === bundle.id}
                      className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {purchaseLoading === bundle.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCartIcon className="w-5 h-5" />
                          Purchase Bundle
                        </>
                      )}
                    </button>
                    
                    <Link
                      href={`/bundles/${bundle.id}`}
                      className="block w-full py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bundles..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="MODULE">Module Bundles</option>
                <option value="COURSE">Course Bundles</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Bundles</option>
                <option value="featured">Featured</option>
                <option value="popular">Popular</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="savings">Highest Savings</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {stats?.categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Minimum Savings */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Minimum Savings: {minSavings}%
              </label>
              <input
                type="range"
                min="0"
                max="80"
                value={minSavings}
                onChange={(e) => setMinSavings(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Showing {filteredBundles.length} bundles</span>
              {searchTerm && <span>• Matching "{searchTerm}"</span>}
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Bundle Grid */}
        <div className="space-y-8">
          {filteredBundles.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
                <ShoppingBagIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">No Bundles Found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search criteria or browse all available bundles
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    {/* Bundle Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {bundle.type === 'COURSE' ? 'Course Bundle' : 'Module Bundle'}
                          </span>
                          
                          {bundle.isFeatured && (
                            <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                              <SparklesIcon className="w-3 h-3" />
                              <span>Featured</span>
                            </div>
                          )}
                          
                          {bundle.isPopular && (
                            <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                              <FireIcon className="w-3 h-3" />
                              <span>Popular</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{bundle.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {bundle.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{bundle.user.name}</p>
                        <p className="text-gray-400 text-xs">Bundle Creator</p>
                      </div>
                      {bundle.user.isAdmin && (
                        <div className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Bundle Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/5 rounded-2xl">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{bundle.totalItems}</p>
                        <p className="text-xs text-gray-400">Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-400">{bundle.salesCount}</p>
                        <p className="text-xs text-gray-400">Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-400">{bundle.viewCount}</p>
                        <p className="text-xs text-gray-400">Views</p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4 p-4 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                        {bundle.savings > 0 && (
                          <span className="text-gray-400 line-through">${bundle.individualTotal.toFixed(2)}</span>
                        )}
                      </div>
                      {bundle.savings > 0 && (
                        <div className="text-green-400 font-medium text-sm">
                          Save ${bundle.savings.toFixed(2)} ({bundle.savingsPercentage}% off)
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handlePurchaseBundle(bundle.id)}
                        disabled={purchaseLoading === bundle.id}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {purchaseLoading === bundle.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCartIcon className="w-5 h-5" />
                            Purchase - ${bundle.finalPrice.toFixed(2)}
                          </>
                        )}
                      </button>
                      
                      <Link
                        href={`/bundles/${bundle.id}`}
                        className="block w-full py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="text-gray-400">
                    Page {currentPage} of {totalPages} • {filteredBundles.length} bundles
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                    >
                      Next
                    </button>
                  </div>
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
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}
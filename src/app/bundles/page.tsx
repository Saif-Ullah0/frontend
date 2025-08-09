"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCartIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  PlusIcon,
  AcademicCapIcon,
  ChartBarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';
import BundleCreator from '../../components/BundleCreator';
import CourseBundleCreator from '../../components/CourseBundleCreator';

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  totalPrice: number;
  finalPrice: number;
  discount: number;
  isPurchased: boolean;
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
  items?: Array<{
    module: {
      id: number;
      title: string;
      price: number;
      duration?: number;
      course: { title: string };
    };
  }>;
  courseItems?: Array<{
    course: {
      id: number;
      title: string;
      price: number;
      imageUrl?: string;
      category: { name: string };
      modules: Array<{ id: number; title: string; duration?: number }>;
    };
  }>;
  user: {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  createdAt: string;
}

interface UserAnalytics {
  overview: {
    totalBundles: number;
    activeBundles: number;
    totalRevenue: number;
    totalSales: number;
    totalViews: number;
    featuredBundles: number;
    popularBundles: number;
  };
  bundleTypeStats: Array<{
    type: string;
    _count: { id: number };
    _sum: { revenue: number; salesCount: number; viewCount: number };
  }>;
  topBundles: Array<{
    id: number;
    name: string;
    revenue: number;
    salesCount: number;
    viewCount: number;
  }>;
}

type ActiveTab = 'my-bundles' | 'create-module-bundle' | 'create-course-bundle' | 'analytics';
type FilterType = 'all' | 'MODULE' | 'COURSE';
type StatusFilter = 'all' | 'active' | 'inactive' | 'featured' | 'popular' | 'public' | 'private';

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<Bundle[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-bundles');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Enhanced fetch bundles with better error handling
  const fetchBundles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: filterType,
        status: statusFilter,
        sort: sortBy,
        limit: '50'
      });

      const response = await fetch(`http://localhost:5000/api/bundles/my-bundles?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Enhanced bundle response:', data);
        
        const bundlesArray = data.bundles || [];
        setBundles(Array.isArray(bundlesArray) ? bundlesArray : []);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to fetch bundles:', response.status, errorData);
        toast.error(errorData.message || 'Failed to load bundles');
        setBundles([]);
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Something went wrong while loading bundles');
      setBundles([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, statusFilter, sortBy]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bundles/my-analytics', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Enhanced analytics response:', data);
        setAnalytics(data.analytics || null);
      } else {
        console.error('❌ Failed to fetch analytics:', response.status);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  // Apply search and additional filtering
  useEffect(() => {
    let filtered = bundles;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(bundle =>
        bundle.name.toLowerCase().includes(search) ||
        bundle.description?.toLowerCase().includes(search)
      );
    }

    setFilteredBundles(filtered);
  }, [bundles, searchTerm]);

  useEffect(() => {
    if (activeTab === 'my-bundles') {
      fetchBundles();
    }
  }, [activeTab, fetchBundles]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

  const handleDeleteBundle = async (bundleId: number) => {
    const bundle = bundles.find(b => b.id === bundleId);
    const confirmMessage = bundle?.salesCount > 0 
      ? `Are you sure you want to delete "${bundle.name}"? This bundle has ${bundle.salesCount} sales.`
      : `Are you sure you want to delete "${bundle?.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/bundles/${bundleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bundle deleted successfully');
        fetchBundles();
        fetchAnalytics();
      } else {
        toast.error(data.message || data.error || 'Failed to delete bundle');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong');
    }
  };

  const handleBundleCreated = () => {
    toast.success('Bundle created successfully!');
    fetchBundles();
    fetchAnalytics();
    setActiveTab('my-bundles');
  };

  if (loading && activeTab === 'my-bundles') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading bundles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">My Bundle Workshop</h1>
          <p className="text-gray-400 text-lg">Create and manage your custom learning packages</p>
          
          {/* Quick Links */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <Link 
              href="/shop/bundles"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Browse Bundle Marketplace</span>
            </Link>
            
            {analytics && analytics.overview.totalRevenue > 0 && (
              <div className="inline-flex items-center gap-2 text-green-400">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span>Total Revenue: ${analytics.overview.totalRevenue.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('my-bundles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'my-bundles'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShoppingCartIcon className="w-4 h-4" />
            My Bundles ({bundles.length})
          </button>
          <button
            onClick={() => setActiveTab('create-module-bundle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'create-module-bundle'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Create Module Bundle
          </button>
          <button
            onClick={() => setActiveTab('create-course-bundle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'create-course-bundle'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <AcademicCapIcon className="w-4 h-4" />
            Create Course Bundle
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ChartBarIcon className="w-4 h-4" />
            Analytics
          </button>
        </div>

        {/* Content */}
        {activeTab === 'my-bundles' && (
          <div className="space-y-8">
            {/* Enhanced Controls */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search your bundles..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  {/* Type Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="MODULE">Module Bundles</option>
                    <option value="COURSE">Course Bundles</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="featured">Featured</option>
                    <option value="popular">Popular</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="sales">Most Sales</option>
                    <option value="revenue">Highest Revenue</option>
                    <option value="views">Most Views</option>
                  </select>
                </div>
              </div>

              {/* Quick Stats */}
              {bundles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{bundles.length}</p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{bundles.filter(b => b.isActive).length}</p>
                    <p className="text-xs text-gray-400">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{bundles.filter(b => b.isPublic).length}</p>
                    <p className="text-xs text-gray-400">Public</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{bundles.filter(b => b.isFeatured).length}</p>
                    <p className="text-xs text-gray-400">Featured</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{bundles.reduce((sum, b) => sum + b.salesCount, 0)}</p>
                    <p className="text-xs text-gray-400">Sales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-400">${bundles.reduce((sum, b) => sum + b.revenue, 0).toFixed(0)}</p>
                    <p className="text-xs text-gray-400">Revenue</p>
                  </div>
                </div>
              )}
            </div>

            {filteredBundles.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
                  <ShoppingCartIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {bundles.length === 0 ? 'No Bundles Yet' : 'No Bundles Match Your Filters'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {bundles.length === 0 
                      ? 'Create your first bundle to get started with custom learning packages'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('create-module-bundle')}
                      className="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Create Module Bundle
                    </button>
                    <button
                      onClick={() => setActiveTab('create-course-bundle')}
                      className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      Create Course Bundle
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBundles.map((bundle) => (
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

                          {/* Visibility Indicator */}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            bundle.isPublic ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {bundle.isPublic ? <GlobeAltIcon className="w-3 h-3" /> : <LockClosedIcon className="w-3 h-3" />}
                            <span>{bundle.isPublic ? 'Public' : 'Private'}</span>
                          </div>
                          
                          {bundle.isFeatured && (
                            <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                              <SparklesIcon className="w-3 h-3" />
                              <span>Featured</span>
                            </div>
                          )}
                          
                          {bundle.isPopular && (
                            <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                              <ArrowTrendingUpIcon className="w-3 h-3" />
                              <span>Popular</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{bundle.description}</p>
                        )}
                      </div>
                      
                      {!bundle.isActive && (
                        <div className="flex items-center gap-1 text-red-400 bg-red-500/20 px-3 py-1 rounded-full text-sm font-medium">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          <span>Inactive</span>
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
                        <p className="text-lg font-bold text-green-400">${bundle.revenue.toFixed(0)}</p>
                        <p className="text-xs text-gray-400">Revenue</p>
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
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" />
                          <span>{bundle.viewCount} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{new Date(bundle.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Link
                        href={`/bundles/${bundle.id}`}
                        className="block w-full py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                      >
                        View Details
                      </Link>
                      
                      {bundle.canDelete && (
                        <button
                          onClick={() => handleDeleteBundle(bundle.id)}
                          className="w-full py-2 bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete Bundle
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create-module-bundle' && (
          <BundleCreator onBundleCreated={handleBundleCreated} />
        )}

        {activeTab === 'create-course-bundle' && (
          <CourseBundleCreator onBundleCreated={handleBundleCreated} />
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <ShoppingCartIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Bundles</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalBundles}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${analytics.overview.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalSales}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <EyeIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalViews}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle Type Distribution */}
            {analytics.bundleTypeStats.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Bundle Performance by Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics.bundleTypeStats.map((stat) => (
                    <div key={stat.type} className="bg-white/5 rounded-xl p-4">
                      <h4 className="font-semibold text-white mb-3">
                        {stat.type === 'COURSE' ? 'Course Bundles' : 'Module Bundles'} ({stat._count.id})
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Revenue:</span>
                          <span className="text-green-400 font-medium">${(stat._sum.revenue || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Sales:</span>
                          <span className="text-blue-400 font-medium">{stat._sum.salesCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Views:</span>
                          <span className="text-purple-400 font-medium">{stat._sum.viewCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Performing Bundles */}
            {analytics.topBundles.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Top Performing Bundles</h3>
                <div className="space-y-4">
                  {analytics.topBundles.map((bundle, index) => (
                    <div key={bundle.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{bundle.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{bundle.viewCount} views</span>
                            <span>{bundle.salesCount} sales</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">${bundle.revenue.toFixed(2)}</div>
                        <div className="text-sm text-gray-400">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
      `}</style>
    </div>
  );
}
// frontend/src/app/bundles/page.tsx - Enhanced Version
"use client";

import { useState, useEffect } from 'react';
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
  ArrowTrendingUpIcon  // ✅ CORRECT NAME
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
  salesCount: number;
  revenue: number;
  viewCount: number;
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
  createdAt: string;
}

interface UserAnalytics {
  overview: {
    totalBundles: number;
    activeBundles: number;
    totalRevenue: number;
    totalSales: number;
    totalViews: number;
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

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-bundles');
  const [filterType, setFilterType] = useState<'all' | 'MODULE' | 'COURSE'>('all');

  useEffect(() => {
    fetchBundles();
    fetchAnalytics();
  }, []);

 const fetchBundles = async () => {
  try {
    setLoading(true);
    const response = await fetch('http://localhost:5000/api/bundles/my-bundles', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📦 Bundle response:', data); // Debug log
      
      // Handle the response format: { success: true, bundles: [...] }
      const bundlesArray = data.bundles || data || [];
      
      // Ensure it's always an array
      setBundles(Array.isArray(bundlesArray) ? bundlesArray : []);
    } else {
      console.error('❌ Failed to fetch bundles:', response.status);
      toast.error('Failed to load bundles');
      setBundles([]); // Set empty array on error
    }
  } catch (error) {
    console.error('Error fetching bundles:', error);
    toast.error('Something went wrong');
    setBundles([]); // Set empty array on error
  } finally {
    setLoading(false);
  }
};

 const fetchAnalytics = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/bundles/my-analytics', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📊 Analytics response:', data); // Debug log
      
      // Handle the response format
      setAnalytics(data.analytics || data || null);
    } else {
      console.error('❌ Failed to fetch analytics:', response.status);
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};

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
        toast.error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Something went wrong');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleDeleteBundle = async (bundleId: number) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/bundles/${bundleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Bundle deleted successfully');
        fetchBundles();
        fetchAnalytics();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete bundle');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong');
    }
  };

  const handleBundleCreated = () => {
    fetchBundles();
    fetchAnalytics();
    setActiveTab('my-bundles');
  };

  const calculateSavings = (totalPrice: number, finalPrice: number) => {
    const savings = totalPrice - finalPrice;
    const percentage = Math.round((savings / totalPrice) * 100);
    return { savings, percentage };
  };

  const getFilteredBundles = () => {
    if (filterType === 'all') return bundles;
    return bundles.filter(bundle => bundle.type === filterType);
  };

  const getBundleStats = (bundle: Bundle) => {
    const itemCount = bundle.type === 'COURSE' 
      ? bundle.courseItems?.length || 0 
      : bundle.items?.length || 0;
    
    return { itemCount };
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

  const filteredBundles = getFilteredBundles();

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
          
          {/* Quick Link to Marketplace */}
          <div className="mt-4">
            <Link 
              href="/shop/bundles"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Browse Bundle Marketplace</span>
            </Link>
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
          
        </div>

        {/* Content */}
        {activeTab === 'my-bundles' && (
          <div className="space-y-8">
            {/* Filter Tabs */}
            {bundles.length > 0 && (
              <div className="flex gap-2 mb-6">
                {[
                  { key: 'all', label: 'All Bundles', count: bundles.length },
                  { key: 'MODULE', label: 'Module Bundles', count: bundles.filter(b => b.type === 'MODULE').length },
                  { key: 'COURSE', label: 'Course Bundles', count: bundles.filter(b => b.type === 'COURSE').length },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      filterType === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            )}

            {filteredBundles.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
                  <ShoppingCartIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {bundles.length === 0 ? 'No Bundles Yet' : 'No Bundles in This Category'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {bundles.length === 0 
                      ? 'Create your first bundle to get started with custom learning packages'
                      : `You don't have any ${filterType.toLowerCase()} bundles yet`
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
                {filteredBundles.map((bundle) => {
                  const { savings, percentage } = calculateSavings(bundle.totalPrice, bundle.finalPrice);
                  const { itemCount } = getBundleStats(bundle);
                  
                  return (
                    <div
                      key={bundle.id}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                    >
                      {/* Bundle Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
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
                        
                        {bundle.isPurchased && (
                          <div className="flex items-center gap-1 text-green-400 bg-green-500/20 px-3 py-1 rounded-full text-sm font-medium">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Owned</span>
                          </div>
                        )}
                      </div>

                      {/* Bundle Stats
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-white">{itemCount}</div>
                          <div className="text-xs text-gray-400">{bundle.type === 'COURSE' ? 'Courses' : 'Modules'}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-white">{bundle.viewCount}</div>
                          <div className="text-xs text-gray-400">Views</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-white">{bundle.salesCount}</div>
                          <div className="text-xs text-gray-400">Sales</div>
                        </div>
                      </div> */}

                      {/* Pricing */}
                      <div className="mb-4 p-4 bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                          {savings > 0 && (
                            <span className="text-gray-400 line-through">${bundle.totalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        {savings > 0 && (
                          <div className="text-green-400 font-medium text-sm">
                            Save ${savings.toFixed(2)} ({percentage}% off)
                          </div>
                        )}
                        {bundle.revenue > 0 && (
                          <div className="text-blue-400 text-sm mt-1">
                            Revenue: ${bundle.revenue.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        <Link
                          href={`/bundles/${bundle.id}`}
                          className="block w-full py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                        >
                          View Details
                        </Link>
                        
                        {bundle.isPurchased ? (
                          <div className="flex items-center justify-center p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl font-medium">
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Bundle Purchased
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchaseBundle(bundle.id)}
                            disabled={purchaseLoading === bundle.id}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        )}
                        
                        {!bundle.isPurchased && (
                          <button
                            onClick={() => handleDeleteBundle(bundle.id)}
                            className="w-full py-2 bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete Bundle
                          </button>
                        )}
                      </div>

                      {/* Created Date */}
                      <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        <span>Created {new Date(bundle.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <CheckCircleIcon className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Active Bundles</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.activeBundles}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle Type Distribution */}
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
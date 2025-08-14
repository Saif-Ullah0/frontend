// frontend/src/app/bundles/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCartIcon,
  TrashIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  GlobeAltIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  FireIcon,
  HomeIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';
import BundleCreator from '../../components/BundleCreator';

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'COURSE' | 'MODULE';
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
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Analytics {
  overview: {
    totalBundles: number;
    activeBundles: number;
    totalRevenue: number;
    totalSales: number;
    totalViews: number;
  };
}

type ActiveTab = 'my-bundles' | 'create-bundle' | 'analytics';

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-bundles');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBundles = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/bundles', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBundles(data.bundles || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load bundles');
        setBundles([]);
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load bundles');
      setBundles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bundles/analytics/my', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.dashboard || data.analytics);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'my-bundles') {
      fetchBundles();
    }
  }, [activeTab, fetchBundles]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDeleteBundle = async (bundleId: number, bundleName: string) => {
    if (!confirm(`Are you sure you want to delete "${bundleName}"? This action cannot be undone.`)) {
      return;
    }

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
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete bundle');
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

  // Filter bundles based on search and status
  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = !searchTerm || 
      bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && bundle.isActive) ||
      (statusFilter === 'inactive' && !bundle.isActive) ||
      (statusFilter === 'featured' && bundle.isFeatured) ||
      (statusFilter === 'popular' && bundle.isPopular) ||
      (statusFilter === 'public' && bundle.isPublic) ||
      (statusFilter === 'private' && !bundle.isPublic);
    
    return matchesSearch && matchesStatus;
  });

  if (loading && activeTab === 'my-bundles') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading your bundles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white">Bundle Studio</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Bundle Studio</h1>
              <p className="text-gray-400 text-lg">Create, manage, and sell your custom bundles</p>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/shop/bundles"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-300"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>Browse Marketplace</span>
              </Link>

              <Link 
                href="/admin/bundles"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 transition-all duration-300"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span>Admin Panel</span>
              </Link>
            </div>
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
            <ShoppingCartIcon className="w-5 h-5" />
            My Bundles
            {bundles.length > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {bundles.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('create-bundle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'create-bundle'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <PlusIcon className="w-5 h-5" />
            Create Bundle
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'my-bundles' && (
          <div className="space-y-8">
            {/* Search and Filters */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search your bundles..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="featured">Featured</option>
                  <option value="popular">Popular</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            {/* Bundle Grid */}
            {filteredBundles.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 max-w-lg mx-auto">
                  <AcademicCapIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {bundles.length === 0 ? 'Create Your First Bundle' : 'No Bundles Match Your Filters'}
                  </h3>
                  <p className="text-gray-400 mb-8">
                    {bundles.length === 0 
                      ? 'Package your courses or modules together and offer them at a discount'
                      : 'Try adjusting your search terms or filter criteria'
                    }
                  </p>
                  <button
                    onClick={() => setActiveTab('create-bundle')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Create Your First Bundle
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    {/* Bundle Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {bundle.type}
                          </span>

                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            bundle.isPublic ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {bundle.isPublic ? <GlobeAltIcon className="w-3 h-3" /> : <LockClosedIcon className="w-3 h-3" />}
                            <span>{bundle.isPublic ? 'Public' : 'Private'}</span>
                          </div>
                          
                          {bundle.isFeatured && (
                            <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                              <StarIcon className="w-3 h-3" />
                              <span>Featured</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">{bundle.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/5 rounded-lg">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{bundle.totalItems}</p>
                        <p className="text-xs text-gray-400">Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{bundle.salesCount}</p>
                        <p className="text-xs text-gray-400">Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">${bundle.revenue.toFixed(0)}</p>
                        <p className="text-xs text-gray-400">Revenue</p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                        {bundle.savings > 0 && (
                          <span className="text-gray-400 line-through">${bundle.individualTotal.toFixed(2)}</span>
                        )}
                      </div>
                      {bundle.savings > 0 && (
                        <p className="text-green-400 text-sm">
                          Save ${bundle.savings.toFixed(2)} ({bundle.savingsPercentage}% off)
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link
                        href={`/bundles/${bundle.id}`}
                        className="block w-full py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                      >
                        View Details
                      </Link>

                      <div className="flex gap-2">
                        <Link
                          href={`/bundles/${bundle.id}`}
                          target="_blank"
                          className="flex-1 py-2 text-center bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
                        >
                          Open
                        </Link>
                        
                        {bundle.canDelete && (
                          <button
                            onClick={() => handleDeleteBundle(bundle.id, bundle.name)}
                            className="flex-1 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create-bundle' && (
          <BundleCreator onBundleCreated={handleBundleCreated} />
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <ShoppingCartIcon className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Bundles</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalBundles}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${analytics.overview.totalRevenue?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalSales || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <EyeIcon className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-white">{analytics.overview.totalViews || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State for Analytics */}
            {analytics.overview.totalBundles === 0 && (
              <div className="text-center py-20">
                <div className="bg-white/5 border border-white/10 rounded-xl p-12 max-w-lg mx-auto">
                  <ChartBarIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">No Analytics Data</h3>
                  <p className="text-gray-400 mb-8">
                    Create your first bundle to start seeing performance analytics.
                  </p>
                  <button
                    onClick={() => setActiveTab('create-bundle')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Create Your First Bundle
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
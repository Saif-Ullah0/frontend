// frontend/src/app/admin/bundles/page.tsx
"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ShoppingBagIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FireIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';

interface BundleAnalytics {
  overview: {
    totalBundles: number;
    activeBundles: number;
    featuredBundles: number;
    popularBundles: number;
    totalSales: number;
    totalRevenue: number;
  };
  bundleTypeStats: Array<{
    type: string;
    _count: { id: number };
  }>;
  topBundles?: Array<{
    id: number;
    name: string;
    salesCount: number;
    revenue: number;
    viewCount: number;
  }>;
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  totalPrice: number;
  finalPrice: number;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  salesCount: number;
  revenue: number;
  viewCount: number;
  featuredOrder?: number;
  promotedUntil?: string;
  user: {
    name: string;
    email: string;
  };
  moduleItems?: Array<{ module: { title: string; course: { title: string } } }>;
  courseItems?: Array<{ course: { title: string; category: { name: string } } }>;
  createdAt: string;
}

export default function AdminBundleDashboard() {
  const [analytics, setAnalytics] = useState<BundleAnalytics | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [sortBy, setSortBy] = useState<'sales' | 'revenue' | 'views' | 'created'>('sales');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'featured' | 'popular'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnalytics();
    fetchBundles();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/bundles/analytics', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.dashboard);
      } else {
        console.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchBundles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/bundles', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBundles(data.bundles || []);
      } else {
        console.error('Failed to load bundles');
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (bundleId: number, currentStatus: boolean) => {
    setActionLoading(prev => ({ ...prev, [`featured-${bundleId}`]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/bundles/${bundleId}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentStatus }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(`Bundle ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
        fetchBundles();
        fetchAnalytics();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Something went wrong');
    } finally {
      setActionLoading(prev => ({ ...prev, [`featured-${bundleId}`]: false }));
    }
  };

  const handleToggleActive = async (bundleId: number, currentStatus: boolean) => {
    setActionLoading(prev => ({ ...prev, [`active-${bundleId}`]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/bundles/${bundleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(`Bundle ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchBundles();
        fetchAnalytics();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Something went wrong');
    } finally {
      setActionLoading(prev => ({ ...prev, [`active-${bundleId}`]: false }));
    }
  };

  const handleUpdatePopular = async () => {
    setActionLoading(prev => ({ ...prev, 'update-popular': true }));
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/bundles/update-popular', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Popular bundles updated successfully');
        fetchBundles();
        fetchAnalytics();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update popular bundles');
      }
    } catch (error) {
      console.error('Error updating popular:', error);
      toast.error('Something went wrong');
    } finally {
      setActionLoading(prev => ({ ...prev, 'update-popular': false }));
    }
  };

  const getSortedBundles = () => {
    let filtered = bundles;

    // Apply search
    if (searchTerm.trim()) {
      filtered = filtered.filter(bundle =>
        bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(b => b.isActive);
        break;
      case 'featured':
        filtered = filtered.filter(b => b.isFeatured);
        break;
      case 'popular':
        filtered = filtered.filter(b => b.isPopular);
        break;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'sales':
          aValue = a.salesCount;
          bValue = b.salesCount;
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case 'views':
          aValue = a.viewCount;
          bValue = b.viewCount;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading admin dashboard...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const sortedBundles = getSortedBundles();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bundle Management</h1>
            <p className="text-gray-400 text-lg">Manage and analyze bundle performance</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpdatePopular}
              disabled={actionLoading['update-popular']}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading['update-popular'] ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <ArrowTrendingUpIcon className="w-5 h-5" />
                  Update Popular
                </>
              )}
            </button>
            
            <Link
              href="/bundles"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Bundle
            </Link>
          </div>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
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
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <SparklesIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Featured Bundles</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.featuredBundles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Popular Bundles</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.popularBundles}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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
            
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All Bundles', icon: ShoppingBagIcon },
                { key: 'active', label: 'Active', icon: CheckCircleIcon },
                { key: 'featured', label: 'Featured', icon: SparklesIcon },
                { key: 'popular', label: 'Popular', icon: ArrowTrendingUpIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    filterStatus === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="sales">Sort by Sales</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="views">Sort by Views</option>
                <option value="created">Sort by Date</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {sortOrder === 'desc' ? (
                  <ArrowDownIcon className="w-5 h-5" />
                ) : (
                  <ArrowUpIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bundle Management Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">
              Bundle Management ({sortedBundles.length} bundles)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Bundle</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Type</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Creator</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Price</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Performance</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedBundles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No bundles found
                    </td>
                  </tr>
                ) : (
                  sortedBundles.map((bundle) => (
                    <tr key={bundle.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <h4 className="font-semibold text-white mb-1">{bundle.name}</h4>
                          {bundle.description && (
                            <p className="text-sm text-gray-400 line-clamp-1">{bundle.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bundle.type === 'COURSE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {bundle.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{bundle.user.name}</p>
                          <p className="text-sm text-gray-400">{bundle.user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-bold">${bundle.finalPrice.toFixed(2)}</p>
                          {bundle.totalPrice !== bundle.finalPrice && (
                            <p className="text-sm text-gray-400 line-through">${bundle.totalPrice.toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <UserGroupIcon className="w-4 h-4" />
                            <span>{bundle.salesCount} sales</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <EyeIcon className="w-4 h-4" />
                            <span>{bundle.viewCount} views</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-400">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span>${bundle.revenue.toFixed(2)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            {bundle.isActive ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircleIcon className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-sm font-medium ${bundle.isActive ? 'text-green-400' : 'text-red-400'}`}>
                              {bundle.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="flex gap-1">
                            {bundle.isFeatured && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                Featured
                              </span>
                            )}
                            {bundle.isPopular && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleFeatured(bundle.id, bundle.isFeatured)}
                            disabled={actionLoading[`featured-${bundle.id}`]}
                            className={`p-2 rounded-lg transition-colors ${
                              bundle.isFeatured
                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                : 'bg-white/5 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'
                            }`}
                            title={bundle.isFeatured ? 'Remove from featured' : 'Add to featured'}
                          >
                            {actionLoading[`featured-${bundle.id}`] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <StarIcon className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleToggleActive(bundle.id, bundle.isActive)}
                            disabled={actionLoading[`active-${bundle.id}`]}
                            className={`p-2 rounded-lg transition-colors ${
                              bundle.isActive
                                ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                                : 'bg-red-500/20 text-red-400 hover:bg-green-500/20 hover:text-green-400'
                            }`}
                            title={bundle.isActive ? 'Deactivate bundle' : 'Activate bundle'}
                          >
                            {actionLoading[`active-${bundle.id}`] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : bundle.isActive ? (
                              <XCircleIcon className="w-4 h-4" />
                            ) : (
                              <CheckCircleIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
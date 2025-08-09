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
  PlusIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon
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
    _sum: { revenue: number; salesCount: number };
  }>;
  topBundles?: Array<{
    id: number;
    name: string;
    salesCount: number;
    revenue: number;
    viewCount: number;
  }>;
  recentPurchases?: Array<{
    id: number;
    bundle: {
      id: number;
      name: string;
      type: string;
    };
    user: {
      id: number;
      name: string;
      email: string;
    };
    finalPrice: number;
    createdAt: string;
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
  isPublic: boolean;
  salesCount: number;
  revenue: number;
  viewCount: number;
  totalItems: number;
  featuredOrder?: number;
  promotedUntil?: string;
  user: {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  moduleItems?: Array<{ module: { title: string; course: { title: string } } }>;
  courseItems?: Array<{ course: { title: string; category: { name: string } } }>;
  createdAt: string;
}

type FilterStatus = 'all' | 'active' | 'inactive' | 'featured' | 'popular' | 'public' | 'private';
type SortBy = 'sales' | 'revenue' | 'views' | 'created' | 'name';

export default function AdminBundleDashboard() {
  const [analytics, setAnalytics] = useState<BundleAnalytics | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [sortBy, setSortBy] = useState<SortBy>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<'all' | 'MODULE' | 'COURSE'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bundles/admin/analytics', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Admin Analytics:', data);
        setAnalytics(data.dashboard);
      } else {
        console.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  const fetchBundles = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        view: 'admin',
        type: filterType,
        status: filterStatus,
        sort: `${sortBy}-${sortOrder}`,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm
      });

      const response = await fetch(`http://localhost:5000/api/bundles?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Admin Bundles:', data);
        setBundles(data.bundles || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load bundles:', errorData);
        toast.error('Failed to load bundles');
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, sortBy, sortOrder, currentPage, itemsPerPage, searchTerm]);

  // Apply local search filtering
  useEffect(() => {
    let filtered = bundles;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(bundle =>
        bundle.name.toLowerCase().includes(search) ||
        bundle.description?.toLowerCase().includes(search) ||
        bundle.user.name.toLowerCase().includes(search) ||
        bundle.user.email.toLowerCase().includes(search)
      );
    }

    setFilteredBundles(filtered);
  }, [bundles, searchTerm]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const handleToggleFeatured = async (bundleId: number, currentStatus: boolean) => {
    const actionKey = `featured-${bundleId}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/bundles/admin/${bundleId}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentStatus }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Bundle ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
        fetchBundles();
        fetchAnalytics();
      } else {
        toast.error(data.message || data.error || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Something went wrong');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleToggleActive = async (bundleId: number, currentStatus: boolean) => {
    const actionKey = `active-${bundleId}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/bundles/admin/${bundleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Bundle ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchBundles();
        fetchAnalytics();
      } else {
        toast.error(data.message || data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Something went wrong');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleUpdatePopular = async () => {
    const actionKey = 'update-popular';
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      const response = await fetch('http://localhost:5000/api/bundles/admin/update-popular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: 3 }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Popular bundles updated successfully');
        fetchBundles();
        fetchAnalytics();
      } else {
        toast.error(data.message || data.error || 'Failed to update popular bundles');
      }
    } catch (error) {
      console.error('Error updating popular:', error);
      toast.error('Something went wrong');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'feature' | 'unfeature', selectedIds: number[]) => {
    if (selectedIds.length === 0) {
      toast.error('No bundles selected');
      return;
    }

    const actionKey = `bulk-${action}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));

    try {
      // This would require a new bulk action endpoint
      toast.info(`Bulk ${action} functionality coming soon`);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
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

  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage);
  const paginatedBundles = filteredBundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bundle Management</h1>
            <p className="text-gray-400 text-lg">Manage and analyze bundle performance across all systems</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.activeBundles}</p>
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
                  <p className="text-gray-400 text-sm">Popular</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.popularBundles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <ChartBarIcon className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.totalSales}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <CurrencyDollarIcon className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${analytics.overview.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Controls */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bundles, creators..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex gap-2 flex-wrap">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="MODULE">Modules</option>
                <option value="COURSE">Courses</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
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

              {/* Sort Controls */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort as SortBy);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="created-desc">Newest First</option>
                <option value="created-asc">Oldest First</option>
                <option value="sales-desc">Most Sales</option>
                <option value="revenue-desc">Highest Revenue</option>
                <option value="views-desc">Most Views</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>

              {/* Items per page */}
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-400 border-t border-white/10 pt-4">
            <div>
              Showing {paginatedBundles.length} of {filteredBundles.length} bundles
              {searchTerm && ` (filtered from ${bundles.length} total)`}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 hover:bg-white/10"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bundle Management Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">
              Bundle Management ({filteredBundles.length} bundles)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Bundle</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Type</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Creator</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Performance</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBundles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      {searchTerm ? 'No bundles match your search' : 'No bundles found'}
                    </td>
                  </tr>
                ) : (
                  paginatedBundles.map((bundle) => (
                    <tr key={bundle.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{bundle.name}</h4>
                            {bundle.isPublic ? (
                              <GlobeAltIcon className="w-4 h-4 text-blue-400" title="Public Bundle" />
                            ) : (
                              <LockClosedIcon className="w-4 h-4 text-gray-400" title="Private Bundle" />
                            )}
                          </div>
                          {bundle.description && (
                            <p className="text-sm text-gray-400 line-clamp-1 max-w-xs">{bundle.description}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {bundle.totalItems} items • ${bundle.finalPrice.toFixed(2)}
                          </div>
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
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{bundle.user.name}</p>
                            {bundle.user.isAdmin && (
                              <div className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                Admin
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{bundle.user.email}</p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <ChartBarIcon className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{bundle.salesCount} sales</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                            <span className="text-white">${bundle.revenue.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <EyeIcon className="w-4 h-4 text-purple-400" />
                            <span className="text-white">{bundle.viewCount} views</span>
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
                          
                          <div className="flex gap-1 flex-wrap">
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

                          <Link
                            href={`/bundles/${bundle.id}`}
                            className="p-2 bg-white/5 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors"
                            title="View bundle details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bundle Type Distribution */}
            {analytics.bundleTypeStats.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Bundle Distribution by Type</h3>
                <div className="space-y-4">
                  {analytics.bundleTypeStats.map((stat) => (
                    <div key={stat.type} className="bg-white/5 rounded-xl p-4">
                      <h4 className="font-semibold text-white mb-3">
                        {stat.type === 'COURSE' ? 'Course Bundles' : 'Module Bundles'} ({stat._count.id})
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Revenue:</span>
                          <span className="text-green-400 font-medium ml-2">${(stat._sum.revenue || 0).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Sales:</span>
                          <span className="text-blue-400 font-medium ml-2">{stat._sum.salesCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {analytics.recentPurchases && analytics.recentPurchases.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Recent Purchases</h3>
                <div className="space-y-3">
                  {analytics.recentPurchases.slice(0, 5).map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex-1">
                        <p className="text-white font-medium">{purchase.bundle.name}</p>
                        <p className="text-sm text-gray-400">
                          by {purchase.user.name} • {new Date(purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${purchase.finalPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{purchase.bundle.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
// frontend/src/app/admin/bundles/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBagIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  GlobeAltIcon,
  LockClosedIcon,
  AdjustmentsHorizontalIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';
import AdminEditBundleModal from '../../../components/AdminEditBundleModal';

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
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  courseItems?: Array<{
    course: {
      id: number;
      title: string;
      price: number;
      isPaid: boolean;
      category: { name: string };
    };
  }>;
  moduleItems?: Array<{
    module: {
      id: number;
      title: string;
      price: number;
      isFree: boolean;
      course: { title: string; category: { name: string } };
    };
  }>;
  createdAt: string;
}

interface Analytics {
  overview: {
    totalBundles: number;
    activeBundles: number;
    featuredBundles: number;
    popularBundles: number;
    totalSales: number;
    totalRevenue: number;
  };
}

export default function AdminBundleManagement() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/bundles/analytics', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.dashboard);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  const fetchBundles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:5000/api/admin/bundles?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBundles(data.bundles || []);
      } else {
        toast.error('Failed to load bundles');
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const handleStatusUpdate = async (bundleId: number, field: string, value: boolean) => {
    const actionKey = `${field}-${bundleId}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/bundles/${bundleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(`Bundle ${field.replace('is', '').toLowerCase()} updated successfully`);
        fetchBundles();
        fetchAnalytics();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update bundle');
      }
    } catch (error) {
      console.error('Error updating bundle:', error);
      toast.error('Something went wrong');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleUpdatePopular = async () => {
    const actionKey = 'update-popular';
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/bundles/update-popular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: 3 }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Updated ${data.updatedCount} bundles as popular`);
        fetchBundles();
        fetchAnalytics();
      } else {
        toast.error(data.error || 'Failed to update popular bundles');
      }
    } catch (error) {
      console.error('Error updating popular:', error);
      toast.error('Something went wrong');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDeleteBundle = async (bundleId: number, bundleName: string, salesCount: number) => {
    let confirmMessage = `Are you sure you want to delete "${bundleName}"?`;
    if (salesCount > 0) {
      confirmMessage += ` This bundle has ${salesCount} sales and will permanently delete purchase records.`;
    }
    
    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/bundles/${bundleId}?force=true`, {
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
      console.error('Error deleting bundle:', error);
      toast.error('Something went wrong');
    }
  };

  const handleEditBundle = async (bundleId: number) => {
    try {
      // Fetch full bundle details for editing
      const response = await fetch(`http://localhost:5000/api/admin/bundles/${bundleId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setEditingBundle(data.bundle);
        setEditModalOpen(true);
      } else {
        toast.error('Failed to load bundle details');
      }
    } catch (error) {
      console.error('Error fetching bundle details:', error);
      toast.error('Failed to load bundle details');
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingBundle(null);
  };

  const handleBundleUpdated = () => {
    fetchBundles();
    fetchAnalytics();
  };

  if (loading && bundles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bundle Management</h1>
            <p className="text-gray-400">Manage all bundles across the platform</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/bundles"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Bundle
            </Link>
            
            <button
              onClick={handleUpdatePopular}
              disabled={actionLoading['update-popular']}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading['update-popular'] ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              )}
              Update Popular
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.totalBundles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.activeBundles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-sm">Featured</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.featuredBundles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <StarIcon className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 text-sm">Popular</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.popularBundles}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-gray-400 text-sm">Sales</p>
                  <p className="text-2xl font-bold text-white">{analytics.overview.totalSales}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="w-8 h-8 text-pink-400" />
                <div>
                  <p className="text-gray-400 text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-white">${analytics.overview.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bundles, creators..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="course">Course Bundles</option>
                <option value="module">Module Bundles</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
        </div>

        {/* Bundles Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-semibold">Bundle</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Creator</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Performance</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Status</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bundles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No bundles found
                    </td>
                  </tr>
                ) : (
                  bundles.map((bundle) => (
                    <tr key={bundle.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-white">{bundle.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {bundle.type}
                            </span>
                            {bundle.isPublic ? (
                              <GlobeAltIcon className="w-4 h-4 text-blue-400" title="Public" />
                            ) : (
                              <LockClosedIcon className="w-4 h-4 text-gray-400" title="Private" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {bundle.totalItems} items • ${bundle.finalPrice.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <p className="text-white font-semibold">{bundle.user.name}</p>
                          <p className="text-sm text-gray-400">{bundle.user.email}</p>
                          {bundle.user.role === 'ADMIN' && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <UserGroupIcon className="w-4 h-4 text-blue-400" />
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
                        <div className="space-y-2">
                          <div className={`text-sm font-semibold ${bundle.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {bundle.isActive ? 'Active' : 'Inactive'}
                          </div>
                          
                          <div className="flex gap-1 flex-wrap">
                            {bundle.isFeatured && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                Featured
                              </span>
                            )}
                            {bundle.isPopular && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleStatusUpdate(bundle.id, 'isFeatured', !bundle.isFeatured)}
                            disabled={actionLoading[`isFeatured-${bundle.id}`]}
                            className={`p-2 rounded-lg transition-colors ${
                              bundle.isFeatured
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-white/5 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'
                            }`}
                            title={bundle.isFeatured ? 'Remove featured' : 'Make featured'}
                          >
                            {actionLoading[`isFeatured-${bundle.id}`] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <StarIcon className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleStatusUpdate(bundle.id, 'isActive', !bundle.isActive)}
                            disabled={actionLoading[`isActive-${bundle.id}`]}
                            className={`p-2 rounded-lg transition-colors ${
                              bundle.isActive
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                            title={bundle.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {actionLoading[`isActive-${bundle.id}`] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : bundle.isActive ? (
                              <XCircleIcon className="w-4 h-4" />
                            ) : (
                              <CheckCircleIcon className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleStatusUpdate(bundle.id, 'isPublic', !bundle.isPublic)}
                            disabled={actionLoading[`isPublic-${bundle.id}`]}
                            className={`p-2 rounded-lg transition-colors ${
                              bundle.isPublic
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400'
                            }`}
                            title={bundle.isPublic ? 'Make private' : 'Make public'}
                          >
                            {actionLoading[`isPublic-${bundle.id}`] ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : bundle.isPublic ? (
                              <LockClosedIcon className="w-4 h-4" />
                            ) : (
                              <GlobeAltIcon className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleEditBundle(bundle.id)}
                            className="p-2 bg-white/5 text-gray-400 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors"
                            title="Edit bundle"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/bundles/${bundle.id}`}
                            className="p-2 bg-white/5 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors"
                            title="View bundle"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteBundle(bundle.id, bundle.name, bundle.salesCount)}
                            className="p-2 bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                            title="Delete bundle"
                          >
                            <TrashIcon className="w-4 h-4" />
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

      {/* Edit Bundle Modal */}
      {editingBundle && (
        <AdminEditBundleModal
          bundle={editingBundle}
          isOpen={editModalOpen}
          onClose={handleEditModalClose}
          onUpdate={handleBundleUpdated}
        />
      )}
    </div>
  );
}
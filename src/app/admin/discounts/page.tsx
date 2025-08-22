'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import DiscountModal from '@/components/admin/DiscountModal';
import {
  TicketIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Discount {
  id: number;
  code: string;
  name: string | null | undefined;
  description: string | null | undefined;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  usedCount: number;
  maxUses: number | null | undefined;
  maxUsesPerUser: number | null | undefined;
  startsAt: string | null | undefined;
  expiresAt: string | null | undefined;
  minPurchaseAmount: number | null | undefined;
  maxDiscountAmount: number | null | undefined;
  isActive: boolean;
  isPublic: boolean;
  applicableToType: 'ALL' | 'COURSE' | 'CATEGORY';
  applicableToId: number | null | undefined;
  applicableToName: string | null | undefined;
}

interface Category {
  id: number;
  name: string;
}

interface Course {
  id: number;
  title: string;
  categoryId: number;
}

interface Analytics {
  totalCodes: number;
  activeCodes: number;
  totalUsages: number;
  totalSavings: number;
  expiringSoon: number;
  recentActivity: {
    last30Days: number;
    totalSavingsLast30Days: number;
  };
}

export default function AdminDiscountsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null | undefined>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscounts = useCallback(async () => {
    if (!user) {
      setError('Please log in to manage discounts');
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discounts`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login?redirect=/admin/discounts');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const { data } = await response.json();
      setDiscounts(data.discountCodes);
    } catch (err) {
      console.error('Error fetching discounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load discounts');
    }
  }, [user, router]);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login?redirect=/admin/discounts');
          return;
        }
        throw new Error('Failed to fetch categories');
      }
      const data: Category[] = await response.json();
      const categoryMap = data.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.name }), {});
      setCategories(categoryMap);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  }, [user, router]);

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login?redirect=/admin/discounts');
          return;
        }
        throw new Error('Failed to fetch courses');
      }
      const data: Course[] = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  }, [user, router]);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discounts/analytics`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login?redirect=/admin/discounts');
          return;
        }
        throw new Error('Failed to fetch analytics');
      }
      const { data } = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchDiscounts(), fetchCategories(), fetchCourses(), fetchAnalytics()])
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setError('Please log in to manage discounts');
      router.push('/login?redirect=/admin/discounts');
    }
  }, [user, fetchDiscounts, fetchCategories, fetchCourses, fetchAnalytics, router]);

  const handleDeactivate = async (id: number) => {
    if (!user) {
      toast.error('Please log in to manage discounts');
      router.push('/login?redirect=/admin/discounts');
      return;
    }
    if (!confirm('Are you sure you want to deactivate this discount?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login?redirect=/admin/discounts');
          return;
        }
        throw new Error('Failed to deactivate discount');
      }
      toast.success('Discount deactivated successfully');
      fetchDiscounts();
      fetchAnalytics();
    } catch (error) {
      console.error('Error deactivating discount:', error);
      toast.error('Failed to deactivate discount');
    }
  };

  const handleEdit = (discount: Discount) => {
    setSelectedDiscount(discount);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedDiscount(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDiscount(null);
  };

  const handleModalSuccess = () => {
    fetchDiscounts();
    fetchAnalytics();
    setModalOpen(false);
    setSelectedDiscount(null);
  };

  const filteredDiscounts = discounts
    .filter(discount => {
      if (filter === 'active') return discount.isActive;
      if (filter === 'inactive') return !discount.isActive;
      return true;
    })
    .filter(discount =>
      discount.code.toLowerCase().includes(search.toLowerCase()) ||
      (discount.name && discount.name.toLowerCase().includes(search.toLowerCase()))
    );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading discounts...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-400 mb-4">⚠️ {error}</div>
            <button
              onClick={() => Promise.all([fetchDiscounts(), fetchCategories(), fetchCourses(), fetchAnalytics()])}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Discounts Management</h1>
          <p className="text-gray-400">Manage discount codes and view analytics for your platform.</p>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Discount Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-semibold text-gray-300">Total Codes</h4>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.totalCodes}</p>
              </div>
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <h4 className="text-sm font-semibold text-gray-300">Active Codes</h4>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.activeCodes}</p>
              </div>
              <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-sm font-semibold text-gray-300">Total Savings</h4>
                </div>
                <p className="text-2xl font-bold text-white">${analytics.totalSavings.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBarIcon className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-semibold text-gray-300">Total Usages</h4>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.totalUsages}</p>
              </div>
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5 text-red-400" />
                  <h4 className="text-sm font-semibold text-gray-300">Expiring Soon</h4>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.expiringSoon}</p>
              </div>
              <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBarIcon className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-semibold text-gray-300">Recent Activity (30 Days)</h4>
                </div>
                <p className="text-2xl font-bold text-white">{analytics.recentActivity.last30Days} usages</p>
                <p className="text-sm text-gray-400">${analytics.recentActivity.totalSavingsLast30Days.toFixed(2)} saved</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Inactive
              </button>
            </div>
            <div className="flex gap-4 items-center w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by code or name"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Discount
              </button>
            </div>
          </div>
        </div>

        {/* Discounts Table */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Applies To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                    No discounts found
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map(discount => (
                  <tr key={discount.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-white">{discount.code}</td>
                    <td className="px-6 py-4 text-sm text-white">{discount.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-white">{discount.type}</td>
                    <td className="px-6 py-4 text-sm text-white">
                      {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {discount.applicableToType === 'ALL' ? 'All Items' : discount.applicableToName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {discount.usedCount}/{discount.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {discount.isActive ? (
                        <span className="flex items-center text-green-400">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-400">
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="p-2 text-gray-400 hover:text-blue-400"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(discount.id)}
                          className="p-2 text-gray-400 hover:text-red-400"
                          title="Deactivate"
                        >
                          <TrashIcon className="w-5 h-5" />
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

      {modalOpen && (
        <DiscountModal
          discount={selectedDiscount}
          categories={categories}
          courses={courses}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </AdminLayout>
  );
}
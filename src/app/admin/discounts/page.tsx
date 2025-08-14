// frontend/src/app/admin/discounts/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  TicketIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  PercentBadgeIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TagIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface DiscountCode {
  id: number;
  code: string;
  name?: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser?: number;
  startsAt?: string;
  expiresAt?: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  applicableToType: string;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface DiscountAnalytics {
  totalCodes: number;
  activeCodes: number;
  totalUsages: number;
  totalSavings: number;
  expiringSoon: number;
}

type ActiveTab = 'discounts' | 'create' | 'analytics';
type FilterStatus = 'all' | 'active' | 'inactive' | 'expired' | 'unlimited';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [analytics, setAnalytics] = useState<DiscountAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('discounts');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Create discount form data
  const [discountData, setDiscountData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: 10,
    maxUses: '',
    maxUsesPerUser: 1,
    startsAt: '',
    expiresAt: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    isActive: true,
    isPublic: false
  });

  const fetchDiscounts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/discounts', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎟️ Admin discounts:', data);
        // Ensure we're working with an array
        const discountsArray = Array.isArray(data.discounts) ? data.discounts : 
                              Array.isArray(data) ? data : [];
        setDiscounts(discountsArray);
      } else {
        const errorData = await response.json();
        console.error('Failed to load discounts:', errorData);
        toast.error('Failed to load discounts');
        setDiscounts([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discounts');
      setDiscounts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/discounts/analytics', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Discount analytics:', data);
        setAnalytics(data.analytics || null);
      } else {
        console.error('Failed to load discount analytics');
      }
    } catch (error) {
      console.error('Error fetching discount analytics:', error);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
    fetchAnalytics();
  }, [fetchDiscounts, fetchAnalytics]);

  const handleInputChange = (field: string, value: any) => {
    setDiscountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCode = () => {
    const code = 'SAVE' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setDiscountData(prev => ({ ...prev, code }));
  };

  const handleCreateDiscount = async () => {
    // Validation
    if (!discountData.code.trim()) {
      toast.error('Discount code is required');
      return;
    }

    if (!discountData.name.trim()) {
      toast.error('Discount name is required');
      return;
    }

    if (discountData.value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (discountData.type === 'PERCENTAGE' && discountData.value > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    setCreating(true);

    try {
      const payload = {
        ...discountData,
        maxUses: discountData.maxUses ? parseInt(discountData.maxUses) : null,
        minPurchaseAmount: discountData.minPurchaseAmount ? parseFloat(discountData.minPurchaseAmount) : null,
        maxDiscountAmount: discountData.maxDiscountAmount ? parseFloat(discountData.maxDiscountAmount) : null,
        startsAt: discountData.startsAt ? new Date(discountData.startsAt).toISOString() : null,
        expiresAt: discountData.expiresAt ? new Date(discountData.expiresAt).toISOString() : null
      };

      const response = await fetch('http://localhost:5000/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Discount code created successfully!');
        
        // Reset form
        setDiscountData({
          code: '',
          name: '',
          description: '',
          type: 'PERCENTAGE',
          value: 10,
          maxUses: '',
          maxUsesPerUser: 1,
          startsAt: '',
          expiresAt: '',
          minPurchaseAmount: '',
          maxDiscountAmount: '',
          isActive: true,
          isPublic: false
        });

        fetchDiscounts();
        fetchAnalytics();
        setActiveTab('discounts');
      } else {
        toast.error(data.error || 'Failed to create discount code');
      }
    } catch (error) {
      console.error('Error creating discount:', error);
      toast.error('Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (discountId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/discounts/${discountId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(`Discount ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchDiscounts();
        fetchAnalytics();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update discount status');
      }
    } catch (error) {
      console.error('Error toggling discount status:', error);
      toast.error('Something went wrong');
    }
  };

  const handleDeleteDiscount = async (discountId: number) => {
    if (!confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/discounts/${discountId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Discount code deleted successfully');
        fetchDiscounts();
        fetchAnalytics();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete discount code');
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('Something went wrong');
    }
  };

  const isExpired = (discount: DiscountCode) => {
    return discount.expiresAt && new Date(discount.expiresAt) < new Date();
  };

  const isExpiringSoon = (discount: DiscountCode) => {
    if (!discount.expiresAt) return false;
    const expiryDate = new Date(discount.expiresAt);
    const now = new Date();
    const daysDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7 && daysDiff > 0;
  };

  // Filter and sort discounts
  const filteredDiscounts = Array.isArray(discounts) ? discounts
    .filter(discount => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!discount.code.toLowerCase().includes(search) && 
            !discount.name?.toLowerCase().includes(search) &&
            !discount.description?.toLowerCase().includes(search)) {
          return false;
        }
      }

      switch (filterStatus) {
        case 'active':
          return discount.isActive && !isExpired(discount);
        case 'inactive':
          return !discount.isActive;
        case 'expired':
          return isExpired(discount);
        case 'unlimited':
          return !discount.maxUses;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'usage':
          return b.usedCount - a.usedCount;
        case 'value':
          return b.value - a.value;
        default:
          return 0;
      }
    }) : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading discounts...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Discount Management
            </h1>
            <p className="text-gray-400 text-xl">Create and manage discount codes to boost sales</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchDiscounts()}
              className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <TicketIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-300 text-sm font-semibold uppercase tracking-wide">Total Codes</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalCodes}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-green-300 text-sm font-semibold uppercase tracking-wide">Active</p>
                  <p className="text-2xl font-bold text-white">{analytics.activeCodes}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <UsersIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-purple-300 text-sm font-semibold uppercase tracking-wide">Total Uses</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalUsages}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <CurrencyDollarIcon className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-300 text-sm font-semibold uppercase tracking-wide">Total Savings</p>
                  <p className="text-2xl font-bold text-white">${analytics.totalSavings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <ClockIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-red-300 text-sm font-semibold uppercase tracking-wide">Expiring Soon</p>
                  <p className="text-2xl font-bold text-white">{analytics.expiringSoon}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('discounts')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'discounts'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <TicketIcon className="w-5 h-5" />
            All Discounts
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
              {discounts.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <PlusIcon className="w-5 h-5" />
            Create Discount
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'discounts' && (
          <div className="space-y-6">
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
                    placeholder="Search discount codes..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                    <option value="unlimited">Unlimited Use</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="usage">Most Used</option>
                    <option value="value">Highest Value</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                Showing {filteredDiscounts.length} of {discounts.length} discount codes
              </div>
            </div>

            {/* Discounts Grid */}
            {filteredDiscounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-lg mx-auto backdrop-blur-xl">
                  <TicketIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-white mb-4">No Discount Codes Found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first discount code to start offering deals to customers'
                    }
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Create Your First Discount
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDiscounts.map((discount) => (
                  <div key={discount.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {/* Status Badge */}
                          {isExpired(discount) ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                              Expired
                            </span>
                          ) : discount.isActive ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">
                              Inactive
                            </span>
                          )}

                          {/* Type Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            discount.type === 'PERCENTAGE'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {discount.type === 'PERCENTAGE' ? `${discount.value}% OFF` : `$${discount.value} OFF`}
                          </span>

                          {/* Expiring Soon Warning */}
                          {isExpiringSoon(discount) && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-gray-800 rounded-lg px-3 py-2 mb-3 font-mono text-lg font-bold text-center text-white border-2 border-dashed border-gray-600">
                          {discount.code}
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-1">{discount.name}</h3>
                        {discount.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">{discount.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white/5 rounded-xl">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{discount.usedCount}</p>
                        <p className="text-xs text-gray-400">Used</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">
                          {discount.maxUses ? discount.maxUses - discount.usedCount : '∞'}
                        </p>
                        <p className="text-xs text-gray-400">Remaining</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm mb-4">
                      {discount.minPurchaseAmount && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Min Purchase:</span>
                          <span className="text-white">${discount.minPurchaseAmount}</span>
                        </div>
                      )}
                      
                      {discount.expiresAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Expires:</span>
                          <span className={isExpired(discount) ? 'text-red-400' : isExpiringSoon(discount) ? 'text-orange-400' : 'text-white'}>
                            {new Date(discount.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">{new Date(discount.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(discount.id, discount.isActive)}
                        className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                          discount.isActive
                            ? 'bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30'
                            : 'bg-green-600/20 border border-green-600/30 text-green-400 hover:bg-green-600/30'
                        }`}
                      >
                        {discount.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDiscount(discount.id)}
                        className="p-2 bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
                        title="Delete discount"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Create Discount Code</h2>
              <p className="text-gray-400">Set up a new discount to attract more customers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
                  
                  <div className="space-y-6">
                    {/* Discount Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Discount Code *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={discountData.code}
                          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                          placeholder="SAVE20"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          onClick={generateCode}
                          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    {/* Discount Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        value={discountData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Summer Sale 2024"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={discountData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe this discount offer..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Discount Type and Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Discount Type
                        </label>
                        <select
                          value={discountData.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="PERCENTAGE">Percentage (%)</option>
                          <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Discount Value *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step={discountData.type === 'PERCENTAGE' ? '1' : '0.01'}
                          max={discountData.type === 'PERCENTAGE' ? '100' : undefined}
                          value={discountData.value}
                          onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max Total Uses (Optional)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={discountData.maxUses}
                          onChange={(e) => handleInputChange('maxUses', e.target.value)}
                          placeholder="Unlimited"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max Uses Per User
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={discountData.maxUsesPerUser}
                          onChange={(e) => handleInputChange('maxUsesPerUser', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Start Date (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={discountData.startsAt}
                          onChange={(e) => handleInputChange('startsAt', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          End Date (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={discountData.expiresAt}
                          onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Settings & Preview */}
              <div className="lg:col-span-1 space-y-6">
                {/* Advanced Settings */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Minimum Purchase Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountData.minPurchaseAmount}
                        onChange={(e) => handleInputChange('minPurchaseAmount', e.target.value)}
                        placeholder="No minimum"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {discountData.type === 'PERCENTAGE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max Discount Amount
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={discountData.maxDiscountAmount}
                          onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value)}
                          placeholder="No limit"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={discountData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded"
                        />
                        <span className="text-white">Active immediately</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={discountData.isPublic}
                          onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded"
                        />
                        <span className="text-white">Public discount</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
                  
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="bg-gray-800 rounded-lg px-3 py-2 mb-3 font-mono text-lg font-bold text-white border-2 border-dashed border-gray-600">
                      {discountData.code || 'YOUR-CODE'}
                    </div>
                    <p className="text-white font-semibold">
                      {discountData.name || 'Discount Name'}
                    </p>
                    <p className="text-green-400 font-bold text-xl mt-2">
                      {discountData.type === 'PERCENTAGE' ? `${discountData.value}% OFF` : `$${discountData.value} OFF`}
                    </p>
                    {discountData.minPurchaseAmount && (
                      <p className="text-sm text-gray-400 mt-2">
                        Min purchase: ${discountData.minPurchaseAmount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateDiscount}
                  disabled={creating || !discountData.code.trim() || !discountData.name.trim() || discountData.value <= 0}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {creating ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <TicketIcon className="w-6 h-6" />
                      Create Discount Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Discount Analytics</h2>
              <p className="text-gray-400">Track the performance of your discount campaigns</p>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-xl">
                <div className="text-center">
                  <TicketIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Code Management</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Codes:</span>
                      <span className="text-white font-semibold">{analytics.totalCodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Codes:</span>
                      <span className="text-green-400 font-semibold">{analytics.activeCodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inactive:</span>
                      <span className="text-gray-400 font-semibold">{analytics.totalCodes - analytics.activeCodes}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-xl">
                <div className="text-center">
                  <UsersIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Usage Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Uses:</span>
                      <span className="text-purple-400 font-semibold">{analytics.totalUsages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg per Code:</span>
                      <span className="text-white font-semibold">
                        {analytics.totalCodes > 0 ? Math.round(analytics.totalUsages / analytics.totalCodes) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 border border-green-500/30 rounded-2xl p-8 backdrop-blur-xl">
                <div className="text-center">
                  <CurrencyDollarIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Financial Impact</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Savings:</span>
                      <span className="text-green-400 font-semibold">${analytics.totalSavings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Discount:</span>
                      <span className="text-white font-semibold">
                        ${analytics.totalUsages > 0 ? (analytics.totalSavings / analytics.totalUsages).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
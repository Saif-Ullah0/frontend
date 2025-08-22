'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon, TagIcon, CheckIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: number;
  title: string;
  categoryId: number;
}

interface Discount {
  id?: number;
  code: string;
  name: string | null | undefined;
  description: string | null | undefined;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  maxUses: number | null | undefined;
  maxUsesPerUser: number | null | undefined;
  startsAt: string | null | undefined;
  expiresAt: string | null | undefined;
  minPurchaseAmount: number | null | undefined;
  maxDiscountAmount: number | null | undefined;
  isActive: boolean;
  isPublic: boolean;
  applicableToType: 'COURSE' | 'CATEGORY' | 'ALL';
  applicableToId: number | null | undefined;
}

interface DiscountModalProps {
  discount: Discount | null | undefined;
  categories: Record<number, string>;
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function DiscountModal({ discount, categories, courses, onClose, onSuccess }: DiscountModalProps) {
  const [formData, setFormData] = useState<Discount>({
    code: '',
    name: null,
    description: null,
    type: 'PERCENTAGE',
    value: 0,
    maxUses: null,
    maxUsesPerUser: 1,
    startsAt: null,
    expiresAt: null,
    minPurchaseAmount: null,
    maxDiscountAmount: null,
    isActive: true,
    isPublic: false,
    applicableToType: 'ALL',
    applicableToId: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const router = useRouter();
  const isEditing = !!discount;

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code || '',
        name: discount.name || null,
        description: discount.description || null,
        type: discount.type || 'PERCENTAGE',
        value: discount.value || 0,
        maxUses: discount.maxUses || null,
        maxUsesPerUser: discount.maxUsesPerUser || 1,
        startsAt: discount.startsAt ? discount.startsAt.split('T')[0] : null,
        expiresAt: discount.expiresAt ? discount.expiresAt.split('T')[0] : null,
        minPurchaseAmount: discount.minPurchaseAmount || null,
        maxDiscountAmount: discount.maxDiscountAmount || null,
        isActive: discount.isActive ?? true,
        isPublic: discount.isPublic ?? false,
        applicableToType: discount.applicableToType || 'ALL',
        applicableToId: discount.applicableToId || null,
      });
    } else {
      setFormData({
        code: '',
        name: null,
        description: null,
        type: 'PERCENTAGE',
        value: 0,
        maxUses: null,
        maxUsesPerUser: 1,
        startsAt: null,
        expiresAt: null,
        minPurchaseAmount: null,
        maxDiscountAmount: null,
        isActive: true,
        isPublic: false,
        applicableToType: 'ALL',
        applicableToId: null,
      });
    }
  }, [discount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Discount code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    } else if (formData.type === 'PERCENTAGE' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (formData.applicableToType !== 'ALL' && !formData.applicableToId) {
      newErrors.applicableToId = 'Please select a specific item';
    }

    if (formData.minPurchaseAmount && formData.minPurchaseAmount < 0) {
      newErrors.minPurchaseAmount = 'Minimum purchase amount cannot be negative';
    }

    if (formData.maxDiscountAmount && formData.maxDiscountAmount <= 0) {
      newErrors.maxDiscountAmount = 'Maximum discount amount must be greater than 0';
    }

    if (formData.maxUses && formData.maxUses < 1) {
      newErrors.maxUses = 'Maximum uses must be at least 1';
    }

    if (formData.maxUsesPerUser && formData.maxUsesPerUser < 1) {
      newErrors.maxUsesPerUser = 'Maximum uses per user must be at least 1';
    }

    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        newErrors.expiresAt = 'Expiry date cannot be in the past';
      }
    }

    if (formData.startsAt && formData.expiresAt) {
      const startDate = new Date(formData.startsAt);
      const expiryDate = new Date(formData.expiresAt);
      if (expiryDate < startDate) {
        newErrors.expiresAt = 'Expiry date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to manage discounts');
      router.push('/login?redirect=/admin/discounts');
      return;
    }
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name || null,
        description: formData.description || null,
        type: formData.type,
        value: Number(formData.value),
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        maxUsesPerUser: formData.maxUsesPerUser ? Number(formData.maxUsesPerUser) : null,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
        applicableToType: formData.applicableToType,
        applicableToId: formData.applicableToType === 'ALL' ? null : Number(formData.applicableToId),
      };
      const url = isEditing ? `${process.env.NEXT_PUBLIC_API_URL}/api/discounts/${discount?.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/discounts`;
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login?redirect=/admin/discounts');
          return;
        }
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} discount`);
      }
      toast.success(`Discount ${isEditing ? 'updated' : 'created'} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save discount');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCategoryDisplayName = () => {
    if (formData.applicableToType === 'ALL') {
      return 'All Items';
    } else if (formData.applicableToType === 'CATEGORY' && formData.applicableToId) {
      return categories[formData.applicableToId] || 'Unknown Category';
    } else if (formData.applicableToType === 'COURSE' && formData.applicableToId) {
      const course = courses.find(c => c.id === formData.applicableToId);
      return course ? `${course.title} (${categories[course.categoryId] || 'Unknown Category'})` : 'Unknown Course';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TagIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {isEditing ? 'Edit Discount' : 'Create Discount'}
              </h3>
              <p className="text-sm text-gray-400">
                {isEditing ? 'Update discount details' : 'Add a new discount code'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg"
            disabled={loading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discount Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="SAVE10"
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.code ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                />
                {errors.code && <p className="mt-1 text-sm text-red-400">{errors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value || null)}
                  placeholder="e.g., Summer Sale"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value || null)}
                placeholder="e.g., 10% off all programming courses"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={loading}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discount Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as 'PERCENTAGE' | 'FIXED')}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discount Value * {formData.type === 'PERCENTAGE' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                  step={formData.type === 'PERCENTAGE' ? 1 : 0.01}
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.value ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                />
                {errors.value && <p className="mt-1 text-sm text-red-400">{errors.value}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-300">
                Public (visible to all users)
              </label>
            </div>
          </div>

          {/* Application Rules */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Application Rules</h4>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Applies To *
              </label>
              <select
                value={formData.applicableToType}
                onChange={(e) => {
                  handleInputChange('applicableToType', e.target.value as 'ALL' | 'CATEGORY' | 'COURSE');
                  handleInputChange('applicableToId', null);
                }}
                className={`w-full px-4 py-2 bg-gray-800 border ${errors.applicableToType ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                disabled={loading}
              >
                <option value="ALL">All Items</option>
                <option value="CATEGORY">Specific Category</option>
                <option value="COURSE">Specific Course</option>
              </select>
              {errors.applicableToType && <p className="mt-1 text-sm text-red-400">{errors.applicableToType}</p>}
            </div>
            {formData.applicableToType === 'CATEGORY' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Category *
                </label>
                <select
                  value={formData.applicableToId || ''}
                  onChange={(e) => handleInputChange('applicableToId', parseInt(e.target.value) || null)}
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.applicableToId ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {Object.entries(categories).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                {errors.applicableToId && <p className="mt-1 text-sm text-red-400">{errors.applicableToId}</p>}
              </div>
            )}
            {formData.applicableToType === 'COURSE' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Course *
                </label>
                <select
                  value={formData.applicableToId || ''}
                  onChange={(e) => handleInputChange('applicableToId', parseInt(e.target.value) || null)}
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.applicableToId ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({categories[course.categoryId] || 'Unknown Category'})
                    </option>
                  ))}
                </select>
                {errors.applicableToId && <p className="mt-1 text-sm text-red-400">{errors.applicableToId}</p>}
              </div>
            )}
            {getCategoryDisplayName() && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TagIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">DISCOUNT PREVIEW</span>
                </div>
                <p className="text-white font-medium">{getCategoryDisplayName()}</p>
                <p className="text-xs text-gray-400 mt-1">
                  This discount will apply to: {formData.applicableToType.toLowerCase()}
                </p>
              </div>
            )}
          </div>

          {/* Usage Limits & Expiry */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Usage Limits & Expiry</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                  Minimum Purchase Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minPurchaseAmount || ''}
                  onChange={(e) => handleInputChange('minPurchaseAmount', parseFloat(e.target.value) || null)}
                  placeholder="0.00"
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.minPurchaseAmount ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                />
                {errors.minPurchaseAmount && <p className="mt-1 text-sm text-red-400">{errors.minPurchaseAmount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                  Maximum Discount Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxDiscountAmount || ''}
                  onChange={(e) => handleInputChange('maxDiscountAmount', parseFloat(e.target.value) || null)}
                  placeholder="Unlimited"
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.maxDiscountAmount ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                />
                {errors.maxDiscountAmount && <p className="mt-1 text-sm text-red-400">{errors.maxDiscountAmount}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Uses (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUses || ''}
                  onChange={(e) => handleInputChange('maxUses', parseInt(e.target.value) || null)}
                  placeholder="Unlimited"
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.maxUses ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                />
                {errors.maxUses && <p className="mt-1 text-sm text-red-400">{errors.maxUses}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Uses Per User (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUsesPerUser || ''}
                  onChange={(e) => handleInputChange('maxUsesPerUser', parseInt(e.target.value) || null)}
                  placeholder="1"
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.maxUsesPerUser ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                />
                {errors.maxUsesPerUser && <p className="mt-1 text-sm text-red-400">{errors.maxUsesPerUser}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.startsAt || ''}
                  onChange={(e) => handleInputChange('startsAt', e.target.value || null)}
                  placeholder="mm/dd/yyyy"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt || ''}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value || null)}
                  placeholder="mm/dd/yyyy"
                  className={`w-full px-4 py-2 bg-gray-800 border ${errors.expiresAt ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  disabled={loading}
                />
                {errors.expiresAt && <p className="mt-1 text-sm text-red-400">{errors.expiresAt}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                Active (discount can be used immediately)
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  {isEditing ? 'Update Discount' : 'Create Discount'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
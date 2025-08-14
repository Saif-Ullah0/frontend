// src/components/admin/DiscountModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  TagIcon,
  PercentBadgeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Discount {
  id: number;
  code: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
}

interface DiscountModalProps {
  discount?: Discount | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DiscountModal({ discount, onClose, onSuccess }: DiscountModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 0,
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    isActive: true,
    startsAt: '',
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!discount;

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code,
        description: discount.description || '',
        type: discount.type,
        value: discount.value,
        minOrderAmount: discount.minOrderAmount?.toString() || '',
        maxDiscount: discount.maxDiscount?.toString() || '',
        usageLimit: discount.usageLimit?.toString() || '',
        isActive: discount.isActive,
        startsAt: discount.startsAt ? new Date(discount.startsAt).toISOString().slice(0, 16) : '',
        expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().slice(0, 16) : ''
      });
    }
  }, [discount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Discount code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code)) {
      newErrors.code = 'Code can only contain letters, numbers, underscores, and hyphens';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }

    if (formData.type === 'PERCENTAGE' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (formData.minOrderAmount && parseFloat(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = 'Minimum order amount cannot be negative';
    }

    if (formData.maxDiscount && parseFloat(formData.maxDiscount) <= 0) {
      newErrors.maxDiscount = 'Maximum discount must be greater than 0';
    }

    if (formData.usageLimit && parseInt(formData.usageLimit) <= 0) {
      newErrors.usageLimit = 'Usage limit must be greater than 0';
    }

    if (formData.startsAt && formData.expiresAt) {
      if (new Date(formData.startsAt) >= new Date(formData.expiresAt)) {
        newErrors.expiresAt = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        type: formData.type,
        value: formData.value,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        isActive: formData.isActive,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
      };

      const url = isEditing 
        ? `http://localhost:5000/api/discounts/${discount.id}`
        : 'http://localhost:5000/api/discounts';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} discount`);
      }

      toast.success(`Discount ${isEditing ? 'updated' : 'created'} successfully!`);
      onSuccess();
      
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TagIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {isEditing ? 'Edit Discount' : 'Create New Discount'}
              </h3>
              <p className="text-sm text-gray-400">
                {isEditing ? 'Update discount code details' : 'Add a new discount code for your platform'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discount Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="SAVE20"
                className={`w-full px-4 py-3 bg-gray-800 border ${
                  errors.code ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                disabled={loading}
              />
              {errors.code && <p className="mt-1 text-sm text-red-400">{errors.code}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                disabled={loading}
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discount Value * {formData.type === 'PERCENTAGE' ? '(%)' : '($)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.type === 'PERCENTAGE' ? (
                    <PercentBadgeIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                  step={formData.type === 'PERCENTAGE' ? 1 : 0.01}
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${
                    errors.value ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                  disabled={loading}
                />
              </div>
              {errors.value && <p className="mt-1 text-sm text-red-400">{errors.value}</p>}
            </div>

            {/* Min Order Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Order Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minOrderAmount}
                onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                placeholder="0.00"
                className={`w-full px-4 py-3 bg-gray-800 border ${
                  errors.minOrderAmount ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                disabled={loading}
              />
              {errors.minOrderAmount && <p className="mt-1 text-sm text-red-400">{errors.minOrderAmount}</p>}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Discount (for percentage) */}
            {formData.type === 'PERCENTAGE' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Discount Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxDiscount}
                  onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
                  placeholder="No limit"
                  className={`w-full px-4 py-3 bg-gray-800 border ${
                    errors.maxDiscount ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                  disabled={loading}
                />
                {errors.maxDiscount && <p className="mt-1 text-sm text-red-400">{errors.maxDiscount}</p>}
              </div>
            )}

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                placeholder="Unlimited"
                className={`w-full px-4 py-3 bg-gray-800 border ${
                  errors.usageLimit ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                disabled={loading}
              />
              {errors.usageLimit && <p className="mt-1 text-sm text-red-400">{errors.usageLimit}</p>}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => handleInputChange('startsAt', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${
                    errors.expiresAt ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                  disabled={loading}
                />
              </div>
              {errors.expiresAt && <p className="mt-1 text-sm text-red-400">{errors.expiresAt}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for this discount..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              disabled={loading}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              disabled={loading}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
              Activate this discount immediately
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-48"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
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
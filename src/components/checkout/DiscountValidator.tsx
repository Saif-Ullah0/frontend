"use client";

import { useState } from 'react';
import { TagIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface DiscountInfo {
  code: string;
  discountAmount: number;
  finalAmount: number;
  discountCode: {
    id: number;
    code: string;
    name?: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    applicableToType: 'COURSE' | 'CATEGORY' | 'ALL';
    applicableToName?: string;
  };
}

interface DiscountValidatorProps {
  originalAmount: number;
  itemId: number;
  itemType: string;
  onDiscountApplied: (discountInfo: DiscountInfo | null) => void;
  className?: string;
}

export default function DiscountValidator({ 
  originalAmount, 
  itemId,
  itemType,
  onDiscountApplied, 
  className = "" 
}: DiscountValidatorProps) {
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const validateDiscount = async () => {
    if (!user?.token) {
      setError('Please log in to apply discounts');
      toast.error('Please log in to apply discounts');
      return;
    }
    if (!discountCode.trim()) {
      setError('Please enter a discount code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          code: discountCode.toUpperCase(),
          purchaseAmount: originalAmount,
          itemType,
          itemId,
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login?redirect=/checkout';
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || 'Invalid discount code');
      }
      const discountData: DiscountInfo = {
        code: discountCode.toUpperCase(),
        discountAmount: data.data.calculation.discountAmount,
        finalAmount: data.data.calculation.finalAmount,
        discountCode: data.data.discountCode,
      };
      setDiscountInfo(discountData);
      onDiscountApplied(discountData);
      toast.success(`Discount "${discountData.discountCode.name || discountData.code}" applied! You saved $${discountData.discountAmount.toFixed(2)}`);
    } catch (error) {
      console.error('Error validating discount:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate discount';
      setError(errorMessage);
      setDiscountInfo(null);
      onDiscountApplied(null);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountInfo(null);
    setError(null);
    onDiscountApplied(null);
    toast.success('Discount removed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateDiscount();
    }
  };

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TagIcon className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Discount Code</h3>
      </div>

      {!discountInfo ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter discount code"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={loading}
              />
            </div>
            <button
              onClick={validateDiscount}
              disabled={loading || !discountCode.trim() || !user?.token}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Apply'
              )}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <XCircleIcon className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          <div className="text-xs text-gray-400">
            Enter a promo code to get a discount on your purchase.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-medium text-white">
                  {discountInfo.discountCode.name || discountInfo.code} Applied!
                </div>
                {discountInfo.discountCode.description && (
                  <div className="text-sm text-gray-400">{discountInfo.discountCode.description}</div>
                )}
                <div className="text-sm text-green-400">
                  Saved ${discountInfo.discountAmount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">
                  Applies to: {discountInfo.discountCode.applicableToName || discountInfo.discountCode.applicableToType.toLowerCase()}
                </div>
              </div>
            </div>
            <button
              onClick={removeDiscount}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Original Amount:</span>
              <span>${originalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Discount ({discountInfo.code}):</span>
              <span>-${discountInfo.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-white border-t border-gray-700 pt-2">
              <span>Final Amount:</span>
              <span>${discountInfo.finalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-center text-sm text-green-400">
            🎉 You saved ${discountInfo.discountAmount.toFixed(2)}!
          </div>
        </div>
      )}
    </div>
  );
}
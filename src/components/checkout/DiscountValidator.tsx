// src/components/checkout/DiscountValidator.tsx
"use client";

import { useState } from 'react';
import { 
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface DiscountInfo {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  discountAmount: number;
  finalAmount: number;
}

interface DiscountValidatorProps {
  originalAmount: number;
  onDiscountApplied: (discountInfo: DiscountInfo | null) => void;
  className?: string;
}

export default function DiscountValidator({ 
  originalAmount, 
  onDiscountApplied, 
  className = "" 
}: DiscountValidatorProps) {
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateDiscount = async () => {
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
        },
        credentials: 'include',
        body: JSON.stringify({
          code: discountCode.toUpperCase(),
          orderAmount: originalAmount
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid discount code');
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (data.discount.type === 'PERCENTAGE') {
        discountAmount = (originalAmount * data.discount.value) / 100;
        if (data.discount.maxDiscount) {
          discountAmount = Math.min(discountAmount, data.discount.maxDiscount);
        }
      } else {
        discountAmount = data.discount.value;
      }

      const finalAmount = Math.max(0, originalAmount - discountAmount);

      const discountData: DiscountInfo = {
        id: data.discount.id,
        code: data.discount.code,
        type: data.discount.type,
        value: data.discount.value,
        minOrderAmount: data.discount.minOrderAmount,
        maxDiscount: data.discount.maxDiscount,
        discountAmount,
        finalAmount
      };

      setDiscountInfo(discountData);
      onDiscountApplied(discountData);
      toast.success(`Discount applied! You saved $${discountAmount.toFixed(2)}`);

    } catch (error) {
      console.error('Error validating discount:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate discount';
      setError(errorMessage);
      setDiscountInfo(null);
      onDiscountApplied(null);
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
    <div className={`bg-white/5 border border-white/10 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TagIcon className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Discount Code</h3>
      </div>

      {!discountInfo ? (
        /* Discount Input Form */
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                disabled={loading}
              />
            </div>
            <button
              onClick={validateDiscount}
              disabled={loading || !discountCode.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
            Have a promo code? Enter it above to get a discount on your purchase.
          </div>
        </div>
      ) : (
        /* Applied Discount Display */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-medium text-white">
                  {discountInfo.code} Applied!
                </div>
                <div className="text-sm text-green-400">
                  {discountInfo.type === 'PERCENTAGE' 
                    ? `${discountInfo.value}% discount`
                    : `$${discountInfo.value} off`
                  }
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

          {/* Discount Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Original Amount:</span>
              <span>${originalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Discount ({discountInfo.code}):</span>
              <span>-${discountInfo.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-white border-t border-white/10 pt-2">
              <span>Final Amount:</span>
              <span>${discountInfo.finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="text-center p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
            <div className="text-green-400 font-semibold">
              🎉 You saved ${discountInfo.discountAmount.toFixed(2)}!
            </div>
          </div>

          {/* Discount Limitations */}
          {(discountInfo.minOrderAmount || discountInfo.maxDiscount) && (
            <div className="text-xs text-gray-400 space-y-1">
              {discountInfo.minOrderAmount && (
                <div className="flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <span>Minimum order: ${discountInfo.minOrderAmount}</span>
                </div>
              )}
              {discountInfo.maxDiscount && discountInfo.type === 'PERCENTAGE' && (
                <div className="flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <span>Maximum discount: ${discountInfo.maxDiscount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// frontend/src/components/ModulePurchase.tsx
"use client";

import { useState } from 'react';
import { 
  ShoppingCartIcon, 
  LockClosedIcon, 
  CheckCircleIcon, 
  PlayIcon,
  ClockIcon,
  BookOpenIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Module {
  id: number;
  title: string;
  content?: string;
  price: number;
  duration?: number;
  isFree: boolean;
  isPublished: boolean;
  course: {
    id: number;
    title: string;
  };
}

interface ModulePurchaseProps {
  module: Module;
  isOwned: boolean;
  canPurchase: boolean;
  onPurchaseSuccess?: () => void;
  className?: string;
}

export default function ModulePurchase({ 
  module, 
  isOwned, 
  canPurchase,
  onPurchaseSuccess,
  className = ""
}: ModulePurchaseProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!canPurchase) {
      toast.error('Module not available for purchase');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/payment/modules/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: module.id }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        if (data.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = data.checkoutUrl;
        } else if (data.success) {
          // Free module enrolled
          toast.success(data.message);
          onPurchaseSuccess?.();
        }
      } else {
        toast.error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = () => {
    // Navigate to module content
    window.location.href = `/courses/${module.course.id}/modules/${module.id}`;
  };

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 ${className}`}>
      {/* Module Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
          <p className="text-gray-400 text-sm mb-3">{module.course.title}</p>
          
          {/* Module Info */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            {module.duration && (
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{module.duration} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpenIcon className="w-4 h-4" />
              <span>Module</span>
            </div>
          </div>

          {/* Content Preview */}
          {module.content && (
            <p className="text-gray-300 text-sm line-clamp-2 mb-4">
              {module.content.substring(0, 120)}...
            </p>
          )}
        </div>

        {/* Price Display */}
        <div className="text-right ml-4">
          <div className="text-3xl font-bold text-white mb-1">
            {module.isFree || module.price === 0 ? (
              <span className="text-green-400">Free</span>
            ) : (
              <span>${module.price}</span>
            )}
          </div>
          {!module.isFree && module.price > 0 && (
            <div className="text-sm text-gray-400">One-time payment</div>
          )}
        </div>
      </div>

      {/* Status & Action */}
      <div className="space-y-3">
        {/* Ownership Status */}
        {isOwned ? (
          <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">You own this module</span>
            </div>
            <button
              onClick={handleAccess}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <PlayIcon className="w-4 h-4" />
              Access
            </button>
          </div>
        ) : !module.isPublished ? (
          <div className="flex items-center justify-center p-3 bg-gray-500/20 border border-gray-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400">
              <LockClosedIcon className="w-5 h-5" />
              <span className="font-medium">Module not available yet</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={loading || !canPurchase}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              module.isFree || module.price === 0
                ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
            } ${loading || !canPurchase ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                {module.isFree || module.price === 0 ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Enroll for Free
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="w-5 h-5" />
                    Purchase Module - ${module.price}
                  </>
                )}
              </>
            )}
          </button>
        )}

        {/* Security Badge */}
        {!isOwned && canPurchase && !module.isFree && module.price > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <LockClosedIcon className="w-3 h-3" />
            <span>Secure payment via Stripe • Instant access</span>
          </div>
        )}
      </div>
    </div>
  );
}
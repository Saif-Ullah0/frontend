// frontend/src/utils/bundleUtils.ts
export interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  totalPrice: number;
  finalPrice: number;
  discount: number;
  isPurchased?: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  salesCount: number;
  revenue: number;
  viewCount: number;
  items?: Array<{ module: any }>;
  courseItems?: Array<{ course: any }>;
  user?: { name: string };
  createdAt: string;
}

export interface BundleAnalytics {
  totalRevenue: number;
  totalSales: number;
  averageRating: number;
  conversionRate: number;
}

// Calculate bundle savings
export const calculateBundleSavings = (totalPrice: number, finalPrice: number) => {
  const savings = totalPrice - finalPrice;
  const percentage = totalPrice > 0 ? Math.round((savings / totalPrice) * 100) : 0;
  return { savings, percentage };
};

// Calculate bundle duration (for display purposes)
export const calculateBundleDuration = (bundle: Bundle): number => {
  if (bundle.type === 'MODULE' && bundle.items) {
    return bundle.items.reduce((total, item) => {
      return total + (item.module.duration || item.module.videoDuration || 0);
    }, 0);
  }
  
  if (bundle.type === 'COURSE' && bundle.courseItems) {
    return bundle.courseItems.reduce((total, item) => {
      return total + item.course.modules.reduce((moduleTotal: number, module: any) => {
        return moduleTotal + (module.duration || 0);
      }, 0);
    }, 0);
  }
  
  return 0;
};

// Format duration for display
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
};

// Calculate bundle value proposition
export const calculateValueProposition = (bundle: Bundle) => {
  const { savings, percentage } = calculateBundleSavings(bundle.totalPrice, bundle.finalPrice);
  const duration = calculateBundleDuration(bundle);
  const itemCount = bundle.type === 'COURSE' 
    ? bundle.courseItems?.length || 0 
    : bundle.items?.length || 0;
  
  const pricePerItem = itemCount > 0 ? bundle.finalPrice / itemCount : 0;
  const pricePerHour = duration > 0 ? bundle.finalPrice / (duration / 60) : 0;
  
  return {
    savings,
    percentage,
    duration,
    itemCount,
    pricePerItem,
    pricePerHour,
    formattedDuration: formatDuration(duration)
  };
};

// Validate bundle creation data
export const validateBundleData = (data: {
  name: string;
  description?: string;
  selectedItems: number[];
  discount: number;
  type: 'MODULE' | 'COURSE';
}) => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('Bundle name is required');
  }

  if (data.name.length > 100) {
    errors.push('Bundle name must be less than 100 characters');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Bundle description must be less than 500 characters');
  }

  if (data.selectedItems.length === 0) {
    errors.push(`At least one ${data.type.toLowerCase()} must be selected`);
  }

  if (data.selectedItems.length > 20) {
    errors.push(`Maximum 20 ${data.type.toLowerCase()}s allowed per bundle`);
  }

  if (data.discount < 0 || data.discount > 100) {
    errors.push('Discount must be between 0% and 100%');
  }

  if (data.type === 'COURSE' && data.discount > 50) {
    errors.push('Course bundles have a maximum discount of 50%');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sort bundles by various criteria
export const sortBundles = (
  bundles: Bundle[], 
  sortBy: 'created' | 'sales' | 'revenue' | 'views' | 'price' | 'savings', 
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  return [...bundles].sort((a, b) => {
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
      case 'price':
        aValue = a.finalPrice;
        bValue = b.finalPrice;
        break;
      case 'savings':
        aValue = a.totalPrice - a.finalPrice;
        bValue = b.totalPrice - b.finalPrice;
        break;
      case 'created':
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });
};

// Filter bundles by various criteria
export const filterBundles = (bundles: Bundle[], filters: {
  search?: string;
  type?: 'all' | 'MODULE' | 'COURSE';
  priceRange?: [number, number];
  minSavings?: number;
  featured?: boolean;
  popular?: boolean;
  category?: string;
}) => {
  return bundles.filter(bundle => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        bundle.name.toLowerCase().includes(searchTerm) ||
        bundle.description?.toLowerCase().includes(searchTerm) ||
        bundle.user?.name.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type && filters.type !== 'all' && bundle.type !== filters.type) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      if (bundle.finalPrice < minPrice || bundle.finalPrice > maxPrice) {
        return false;
      }
    }

    // Minimum savings filter
    if (filters.minSavings) {
      const savings = bundle.totalPrice - bundle.finalPrice;
      if (savings < filters.minSavings) {
        return false;
      }
    }

    // Featured filter
    if (filters.featured && !bundle.isFeatured) {
      return false;
    }

    // Popular filter
    if (filters.popular && !bundle.isPopular) {
      return false;
    }

    return true;
  });
};

// Generate bundle analytics
export const generateBundleAnalytics = (bundles: Bundle[]): BundleAnalytics => {
  const totalRevenue = bundles.reduce((sum, bundle) => sum + bundle.revenue, 0);
  const totalSales = bundles.reduce((sum, bundle) => sum + bundle.salesCount, 0);
  const totalViews = bundles.reduce((sum, bundle) => sum + bundle.viewCount, 0);
  
  // Simple conversion rate calculation
  const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;
  
  // Mock average rating (you can replace with real data)
  const averageRating = 4.5;

  return {
    totalRevenue,
    totalSales,
    averageRating,
    conversionRate: Math.round(conversionRate * 100) / 100
  };
};

// Check if user can access bundle content
export const canAccessBundle = (bundle: Bundle, userPurchases: number[] = []): boolean => {
  return bundle.isPurchased || userPurchases.includes(bundle.id);
};

// Generate SEO-friendly bundle slug
export const generateBundleSlug = (bundleName: string): string => {
  return bundleName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Calculate recommended price based on items
export const calculateRecommendedPrice = (items: Array<{ price: number }>, discountPercentage: number = 15): number => {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = (totalPrice * discountPercentage) / 100;
  return Math.max(0, totalPrice - discountAmount);
};

// frontend/src/components/bundles/BundleLoadingSkeleton.tsx
"use client";

export function BundleLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-4 bg-white/10 rounded w-24 mb-3"></div>
              <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-full mb-3"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
            <div className="h-6 bg-white/10 rounded w-16"></div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <div className="h-5 bg-white/10 rounded w-8 mb-1"></div>
                <div className="h-3 bg-white/10 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Pricing skeleton */}
          <div className="mb-4 p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-6 bg-white/10 rounded w-20"></div>
              <div className="h-4 bg-white/10 rounded w-16"></div>
            </div>
            <div className="h-4 bg-white/10 rounded w-32"></div>
          </div>

          {/* Actions skeleton */}
          <div className="space-y-3">
            <div className="h-10 bg-white/10 rounded-xl"></div>
            <div className="h-12 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// frontend/src/components/bundles/BundleEmptyState.tsx
"use client";

import { 
  ShoppingCartIcon, 
  PlusIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface BundleEmptyStateProps {
  type?: 'no-results' | 'no-bundles' | 'no-purchases';
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function BundleEmptyState({ 
  type = 'no-bundles',
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = ""
}: BundleEmptyStateProps) {
  const configs = {
    'no-results': {
      icon: ShoppingCartIcon,
      title: title || 'No bundles found',
      description: description || 'Try adjusting your search filters or browse our featured bundles',
      actionText: actionText || 'Browse Featured Bundles',
      actionHref: actionHref || '/shop/bundles?featured=true'
    },
    'no-bundles': {
      icon: PlusIcon,
      title: title || 'No bundles created yet',
      description: description || 'Create your first bundle to start offering custom learning packages',
      actionText: actionText || 'Create Your First Bundle',
      actionHref: actionHref || '#'
    },
    'no-purchases': {
      icon: SparklesIcon,
      title: title || 'No bundle purchases yet',
      description: description || 'Discover amazing learning packages created by our community',
      actionText: actionText || 'Browse Bundle Marketplace',
      actionHref: actionHref || '/shop/bundles'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
        <Icon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-white mb-4">{config.title}</h3>
        <p className="text-gray-400 mb-6">{config.description}</p>
        
        {(actionHref || onAction) && (
          onAction ? (
            <button
              onClick={onAction}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              {config.actionText}
            </button>
          ) : actionHref ? (
            <Link
              href={actionHref}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              {config.actionText}
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
}

// frontend/src/components/bundles/BundleStats.tsx
"use client";

import { 
  CurrencyDollarIcon,
  EyeIcon,
  UserGroupIcon,
  TrendingUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface BundleStatsProps {
  stats: {
    totalRevenue: number;
    totalSales: number;
    totalViews: number;
    conversionRate: number;
    averageOrderValue?: number;
  };
  loading?: boolean;
  className?: string;
}

export function BundleStats({ stats, loading = false, className = "" }: BundleStatsProps) {
  const statItems = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Total Sales',
      value: stats.totalSales.toLocaleString(),
      icon: UserGroupIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUpIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    }
  ];

  if (stats.averageOrderValue) {
    statItems.push({
      label: 'Avg. Order Value',
      value: `$${stats.averageOrderValue.toFixed(2)}`,
      icon: ChartBarIcon,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    });
  }

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                <div className="h-6 bg-white/10 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(statItems.length, 5)} gap-6 ${className}`}>
      {statItems.map((item, index) => {
        const Icon = item.icon;
        
        return (
          <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${item.bgColor} rounded-xl`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{item.label}</p>
                <p className="text-2xl font-bold text-white">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// frontend/src/components/bundles/BundleAlert.tsx
"use client";

import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface BundleAlertProps {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function BundleAlert({ 
  type, 
  title, 
  description, 
  dismissible = true, 
  onDismiss,
  className = ""
}: BundleAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const configs = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
      textColor: 'text-green-300'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      textColor: 'text-yellow-300'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-300'
    },
    error: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
      textColor: 'text-red-300'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${config.textColor}`}>{title}</h4>
          {description && (
            <p className={`text-sm ${config.textColor} opacity-90 mt-1`}>{description}</p>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
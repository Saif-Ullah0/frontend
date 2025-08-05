// frontend/src/components/bundles/AdvancedBundleSearch.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

interface SearchFilters {
  search: string;
  type: 'all' | 'MODULE' | 'COURSE';
  priceRange: [number, number];
  category: string;
  featured: boolean;
  popular: boolean;
  sortBy: 'created' | 'sales' | 'revenue' | 'views' | 'price';
  sortOrder: 'asc' | 'desc';
  minSavings: number;
}

interface AdvancedBundleSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  categories: Array<{ id: number; name: string }>;
  totalResults?: number;
  loading?: boolean;
  className?: string;
}

const defaultFilters: SearchFilters = {
  search: '',
  type: 'all',
  priceRange: [0, 1000],
  category: 'all',
  featured: false,
  popular: false,
  sortBy: 'created',
  sortOrder: 'desc',
  minSavings: 0
};

export default function AdvancedBundleSearch({ 
  onFiltersChange, 
  categories = [],
  totalResults = 0,
  loading = false,
  className = ""
}: AdvancedBundleSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 1000]);

  // Debounced search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((newFilters: SearchFilters) => {
      onFiltersChange(newFilters);
    }, 300),
    [onFiltersChange]
  );

  useEffect(() => {
    debouncedSearch(filters);
  }, [filters, debouncedSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange: [number, number] = [...tempPriceRange];
    newRange[index] = value;
    setTempPriceRange(newRange);
    
    // Apply immediately for better UX
    setFilters(prev => ({ ...prev, priceRange: newRange }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setTempPriceRange([0, 1000]);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.featured) count++;
    if (filters.popular) count++;
    if (filters.minSavings > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl ${className}`}>
      <div className="p-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search bundles by name, description, or creator..."
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Bundle Type */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="MODULE">Module Bundles</option>
            <option value="COURSE">Course Bundles</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
            <option value="sales-desc">Most Popular</option>
            <option value="sales-asc">Least Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="revenue-desc">Highest Revenue</option>
            <option value="views-desc">Most Viewed</option>
          </select>

          {/* Toggle Buttons */}
          <button
            onClick={() => handleFilterChange('featured', !filters.featured)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              filters.featured
                ? 'bg-yellow-500 text-black'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <TagIcon className="w-4 h-4" />
            Featured
          </button>

          <button
            onClick={() => handleFilterChange('popular', !filters.popular)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              filters.popular
                ? 'bg-green-500 text-white'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            Popular
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Advanced Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {loading ? 'Searching...' : `${totalResults} bundles found`}
            </span>
            
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                Price Range: ${tempPriceRange[0]} - ${tempPriceRange[1]}
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={tempPriceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="absolute left-0 -bottom-6 text-xs text-gray-400">$0</span>
                  <span className="absolute right-0 -bottom-6 text-xs text-gray-400">$1000+</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={tempPriceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Minimum Savings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <TagIcon className="w-4 h-4 inline mr-2" />
                Minimum Savings: ${filters.minSavings}
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={filters.minSavings}
                onChange={(e) => handleFilterChange('minSavings', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$0</span>
                <span>$500+</span>
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Bundle Features</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="w-4 h-4 text-blue-500 bg-white/5 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Featured bundles only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.popular}
                    onChange={(e) => handleFilterChange('popular', e.target.checked)}
                    className="w-4 h-4 text-green-500 bg-white/5 border-white/20 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-gray-300">Popular bundles only</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
      `}</style>
    </div>
  );
}

// frontend/src/components/bundles/BundleRecommendations.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  SparklesIcon,
  ArrowRightIcon,
  StarIcon,
  TrendingUpIcon
} from '@heroicons/react/24/outline';
import BundleCard from './BundleCard';

interface Bundle {
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
  viewCount: number;
  items?: Array<{ module: any }>;
  courseItems?: Array<{ course: any }>;
  user?: { name: string };
}

interface BundleRecommendationsProps {
  currentBundleId?: number;
  userInterests?: string[];
  maxRecommendations?: number;
  onPurchase?: (bundleId: number) => void;
  className?: string;
}

export default function BundleRecommendations({ 
  currentBundleId,
  userInterests = [],
  maxRecommendations = 4,
  onPurchase,
  className = ""
}: BundleRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [currentBundleId, userInterests]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for smart recommendations
      const params = new URLSearchParams({
        limit: maxRecommendations.toString(),
        sortBy: 'sales',
        sortOrder: 'desc'
      });

      if (currentBundleId) {
        params.append('exclude', currentBundleId.toString());
      }

      const response = await fetch(`http://localhost:5000/api/bundles?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const bundles = await response.json();
        
        // Smart filtering based on user interests and bundle popularity
        const smartRecommendations = bundles
          .filter((bundle: Bundle) => bundle.isActive && !bundle.isPurchased)
          .sort((a: Bundle, b: Bundle) => {
            // Prioritize featured bundles
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            
            // Then popular bundles
            if (a.isPopular && !b.isPopular) return -1;
            if (!a.isPopular && b.isPopular) return 1;
            
            // Finally by sales count
            return b.salesCount - a.salesCount;
          })
          .slice(0, maxRecommendations);

        setRecommendations(smartRecommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <SparklesIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-bold text-white">Recommended for You</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: maxRecommendations }).map((_, index) => (
            <div key={index} className="bg-white/5 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-3"></div>
              <div className="h-6 bg-white/10 rounded mb-4"></div>
              <div className="h-16 bg-white/10 rounded mb-4"></div>
              <div className="h-8 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-bold text-white">Recommended for You</h3>
        </div>
        
        <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm">
          <span>View All</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((bundle) => (
          <BundleCard
            key={bundle.id}
            bundle={bundle}
            onPurchase={onPurchase}
            compact={true}
            className="hover:shadow-xl hover:shadow-blue-500/10"
          />
        ))}
      </div>

      {/* Recommendation Reason */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl">
        <div className="flex items-start gap-3">
          <TrendingUpIcon className="w-5 h-5 text-green-400 mt-1" />
          <div>
            <h4 className="font-semibold text-white mb-1">Why these bundles?</h4>
            <p className="text-sm text-gray-400">
              Based on popular choices, featured selections, and bundles with high student satisfaction.
              {userInterests.length > 0 && (
                <span> Also matched to your interests: {userInterests.join(', ')}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// frontend/src/hooks/useBundleSearch.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface SearchFilters {
  search: string;
  type: 'all' | 'MODULE' | 'COURSE';
  priceRange: [number, number];
  category: string;
  featured: boolean;
  popular: boolean;
  sortBy: 'created' | 'sales' | 'revenue' | 'views' | 'price';
  sortOrder: 'asc' | 'desc';
  minSavings: number;
}

interface Bundle {
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
  viewCount: number;
  items?: any[];
  courseItems?: any[];
  user?: { name: string };
}

export function useBundleSearch(initialFilters?: Partial<SearchFilters>) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    type: 'all',
    priceRange: [0, 1000],
    category: 'all',
    featured: false,
    popular: false,
    sortBy: 'created',
    sortOrder: 'desc',
    minSavings: 0,
    ...initialFilters
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        
        if (searchFilters.search) params.append('search', searchFilters.search);
        if (searchFilters.type !== 'all') params.append('type', searchFilters.type);
        if (searchFilters.category !== 'all') params.append('category', searchFilters.category);
        if (searchFilters.featured) params.append('featured', 'true');
        if (searchFilters.popular) params.append('popular', 'true');
        params.append('sortBy', searchFilters.sortBy);
        params.append('sortOrder', searchFilters.sortOrder);

        const response = await fetch(`http://localhost:5000/api/bundles?${params}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bundles');
        }

        const data = await response.json();
        
        // Client-side filtering for price range and min savings
        let filteredBundles = data.filter((bundle: Bundle) => {
          const inPriceRange = bundle.finalPrice >= searchFilters.priceRange[0] && 
                               bundle.finalPrice <= searchFilters.priceRange[1];
          const meetsMinSavings = (bundle.totalPrice - bundle.finalPrice) >= searchFilters.minSavings;
          
          return inPriceRange && meetsMinSavings;
        });

        setBundles(filteredBundles);
        setTotalCount(filteredBundles.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setBundles([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Trigger search when filters change
  useEffect(() => {
    debouncedSearch(filters);
  }, [filters, debouncedSearch]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      priceRange: [0, 1000],
      category: 'all',
      featured: false,
      popular: false,
      sortBy: 'created',
      sortOrder: 'desc',
      minSavings: 0,
      ...initialFilters
    });
  }, [initialFilters]);

  return {
    bundles,
    loading,
    error,
    totalCount,
    filters,
    updateFilters,
    resetFilters
  };
}
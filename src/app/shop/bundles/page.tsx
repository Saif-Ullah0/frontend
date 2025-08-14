// frontend/src/app/shop/bundles/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BookOpenIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FireIcon,
  ChevronRightIcon,
  HomeIcon,
  GlobeAltIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

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
  salesCount: number;
  viewCount: number;
  totalItems: number;
  individualTotal: number;
  savings: number;
  savingsPercentage: number;
  user: {
    id: number;
    name: string;
    role: string;
  };
  createdAt: string;
}

export default function BundleMarketplace() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchBundles();
  }, [typeFilter, sortBy]);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(sortBy && { sort: sortBy })
      });

      const response = await fetch(`http://localhost:5000/api/bundles/marketplace?${params}`, {
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
  };

  // Filter bundles based on search
  const filteredBundles = bundles.filter(bundle =>
    !searchTerm || 
    bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bundle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bundle.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort bundles
  const sortedBundles = [...filteredBundles].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.salesCount - a.salesCount;
      case 'popular':
        return b.salesCount - a.salesCount;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price-low':
        return a.finalPrice - b.finalPrice;
      case 'price-high':
        return b.finalPrice - a.finalPrice;
      case 'savings':
        return b.savingsPercentage - a.savingsPercentage;
      default:
        return 0;
    }
  });

  const featuredBundles = bundles.filter(bundle => bundle.isFeatured).slice(0, 3);
  const popularBundles = bundles.filter(bundle => bundle.isPopular).slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white">Bundle Marketplace</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Bundle Marketplace</h1>
              <p className="text-gray-400 text-lg">Discover amazing course and module bundles at discounted prices</p>
            </div>

            <Link
              href="/bundles"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Bundle
            </Link>
          </div>
        </div>

        {/* Featured Bundles */}
        {featuredBundles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Bundles</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBundles.map((bundle) => (
                <Link key={bundle.id} href={`/bundles/${bundle.id}`}>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {bundle.type}
                      </span>
                      <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                        <SparklesIcon className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                    {bundle.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{bundle.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                        {bundle.savings > 0 && (
                          <span className="text-gray-400 line-through ml-2">${bundle.individualTotal.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="text-green-400 font-semibold text-sm">
                        {bundle.savingsPercentage}% off
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bundles, creators..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="course">Course Bundles</option>
                <option value="module">Module Bundles</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="featured">Featured First</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="savings">Biggest Savings</option>
              </select>
            </div>
          </div>
        </div>

        {/* All Bundles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              All Bundles ({sortedBundles.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading bundles...</p>
            </div>
          ) : sortedBundles.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Bundles Found</h3>
              <p className="text-gray-400 mb-8">
                {searchTerm ? 'Try adjusting your search terms' : 'No bundles are currently available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBundles.map((bundle) => (
                <Link key={bundle.id} href={`/bundles/${bundle.id}`}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    {/* Bundle Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {bundle.type}
                      </span>
                      
                      {bundle.isFeatured && (
                        <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                          <SparklesIcon className="w-3 h-3" />
                          <span>Featured</span>
                        </div>
                      )}
                      
                      {bundle.isPopular && (
                        <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                          <FireIcon className="w-3 h-3" />
                          <span>Popular</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                    {bundle.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{bundle.description}</p>
                    )}

                    {/* Bundle Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-white font-semibold">{bundle.totalItems}</p>
                        <p className="text-gray-400">Items</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-white font-semibold">{bundle.salesCount}</p>
                        <p className="text-gray-400">Sales</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-white font-semibold">{bundle.viewCount}</p>
                        <p className="text-gray-400">Views</p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-2xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                          {bundle.savings > 0 && (
                            <span className="text-gray-400 line-through text-sm ml-2">${bundle.individualTotal.toFixed(2)}</span>
                          )}
                        </div>
                        {bundle.savings > 0 && (
                          <div className="text-green-400 font-semibold text-sm">
                            {bundle.savingsPercentage}% off
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>by {bundle.user.name}</span>
                        {bundle.user.role === 'ADMIN' && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// frontend/src/app/shop/bundles/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  FireIcon, 
  SparklesIcon,
  TagIcon,
  UserGroupIcon,
  ClockIcon,
  BookOpenIcon,
  ChevronRightIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PlusIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  SparklesIcon as FeaturedIcon,
  ArrowTrendingUpIcon as PopularIcon,
  TagIcon as DiscountIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';

interface BundleItem {
  module: {
    id: number;
    title: string;
    price: number;
    duration?: number;
    course: {
      title: string;
    };
  };
}

interface CourseBundleItem {
  course: {
    id: number;
    title: string;
    price: number;
    imageUrl?: string;
    category: {
      name: string;
    };
  };
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  totalPrice: number;
  discount: number;
  finalPrice: number;
  isActive: boolean;
  isPurchased: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  salesCount: number;
  revenue: number;
  viewCount: number;
  items?: BundleItem[];
  courseItems?: CourseBundleItem[];
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

type BundleFilter = 'all' | 'featured' | 'popular' | 'course' | 'module';

export default function BundleMarketplace() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<BundleFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBundles();
  }, []);

  useEffect(() => {
    filterBundles();
  }, [bundles, activeFilter, searchTerm]);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bundles', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBundles(data.filter((bundle: Bundle) => bundle.isActive));
      } else {
        toast.error('Failed to load bundles');
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const filterBundles = () => {
    let filtered = bundles;

    // Apply filter
    switch (activeFilter) {
      case 'featured':
        filtered = filtered.filter(bundle => bundle.isFeatured);
        break;
      case 'popular':
        filtered = filtered.filter(bundle => bundle.isPopular);
        break;
      case 'course':
        filtered = filtered.filter(bundle => bundle.type === 'COURSE');
        break;
      case 'module':
        filtered = filtered.filter(bundle => bundle.type === 'MODULE');
        break;
    }

    // Apply search
    if (searchTerm.trim()) {
      filtered = filtered.filter(bundle =>
        bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBundles(filtered);
  };

  const handlePurchaseBundle = async (bundleId: number) => {
    setPurchaseLoading(bundleId);
    
    try {
      const response = await fetch('http://localhost:5000/api/bundles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Something went wrong');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const calculateSavings = (totalPrice: number, finalPrice: number) => {
    const savings = totalPrice - finalPrice;
    const percentage = Math.round((savings / totalPrice) * 100);
    return { savings, percentage };
  };

  const getBundleStats = (bundle: Bundle) => {
    const itemCount = bundle.type === 'COURSE' 
      ? bundle.courseItems?.length || 0 
      : bundle.items?.length || 0;
    
    return { itemCount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading bundle marketplace...</span>
        </div>
      </div>
    );
  }

  const featuredBundles = bundles.filter(b => b.isFeatured);
  const popularBundles = bundles.filter(b => b.isPopular);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
          
          {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            Bundle <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Discover curated learning packages with exclusive discounts. Save up to 50% when you buy modules and courses together.
          </p>
          
          {/* Create Your Own Bundle CTA */}
          <div className="mb-8">
            <Link 
              href="/bundles"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-green-500/25"
            >
              <PlusIcon className="w-6 h-6" />
              Create Your Own Bundle
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-400 mt-3">
              Build custom learning packages and save even more
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-yellow-400" />
              <span>{featuredBundles.length} Featured Bundles</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
              <span>{popularBundles.length} Popular Bundles</span>
            </div>
            <div className="flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-blue-400" />
              <span>Up to 50% Savings</span>
            </div>
          </div>
        </div>

        {/* Featured Bundles Section */}
        {featuredBundles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Bundles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBundles.slice(0, 3).map((bundle) => {
                const { savings, percentage } = calculateSavings(bundle.totalPrice, bundle.finalPrice);
                const { itemCount } = getBundleStats(bundle);
                
                return (
                  <div
                    key={bundle.id}
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-3xl p-6 backdrop-blur-xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                      FEATURED
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{bundle.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          bundle.type === 'COURSE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {bundle.type === 'COURSE' ? 'Course Bundle' : 'Module Bundle'}
                        </span>
                        <span>{itemCount} {bundle.type === 'COURSE' ? 'courses' : 'modules'}</span>
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{bundle.viewCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                        {savings > 0 && (
                          <span className="text-lg text-gray-400 line-through">${bundle.totalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      {savings > 0 && (
                        <div className="text-green-400 font-medium">
                          Save ${savings.toFixed(2)} ({percentage}% off)
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Link
                        href={`/bundles/${bundle.id}`}
                        className="block w-full py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handlePurchaseBundle(bundle.id)}
                        disabled={purchaseLoading === bundle.id || bundle.isPurchased}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {purchaseLoading === bundle.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : bundle.isPurchased ? (
                          'Purchased'
                        ) : (
                          <>
                            <ShoppingCartIcon className="w-5 h-5" />
                            Buy Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bundles..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All Bundles', icon: null },
                { key: 'featured', label: 'Featured', icon: SparklesIcon },
                { key: 'popular', label: 'Popular', icon: ArrowTrendingUpIcon },
                { key: 'course', label: 'Courses', icon: BookOpenIcon },
                { key: 'module', label: 'Modules', icon: ClockIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key as BundleFilter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeFilter === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bundle Grid */}
        <div className="space-y-8">
          {filteredBundles.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
                <ShoppingCartIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">No Bundles Found</h3>
                <p className="text-gray-400">
                  {searchTerm ? 'Try adjusting your search or filters' : 'No bundles available at the moment'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBundles.map((bundle) => {
                const { savings, percentage } = calculateSavings(bundle.totalPrice, bundle.finalPrice);
                const { itemCount } = getBundleStats(bundle);
                
                return (
                  <div
                    key={bundle.id}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 relative"
                  >
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {bundle.isFeatured && (
                        <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </div>
                      )}
                      {bundle.isPopular && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          POPULAR
                        </div>
                      )}
                    </div>

                    {/* Bundle Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{bundle.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          bundle.type === 'COURSE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {bundle.type === 'COURSE' ? 'Course Bundle' : 'Module Bundle'}
                        </span>
                        <span>{itemCount} {bundle.type === 'COURSE' ? 'courses' : 'modules'}</span>
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{bundle.salesCount}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        By {bundle.user.name}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                        {savings > 0 && (
                          <span className="text-gray-400 line-through">${bundle.totalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      {savings > 0 && (
                        <div className="text-green-400 font-medium text-sm">
                          Save ${savings.toFixed(2)} ({percentage}% off)
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Link
                        href={`/bundles/${bundle.id}`}
                        className="block w-full py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        View Details
                        <ChevronRightIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handlePurchaseBundle(bundle.id)}
                        disabled={purchaseLoading === bundle.id || bundle.isPurchased}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {purchaseLoading === bundle.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : bundle.isPurchased ? (
                          'Purchased'
                        ) : (
                          <>
                            <ShoppingCartIcon className="w-5 h-5" />
                            Buy Now - ${bundle.finalPrice.toFixed(2)}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
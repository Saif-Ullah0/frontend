// frontend/src/app/bundles/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  AcademicCapIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ShoppingCartIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  FolderIcon,
  ChevronRightIcon,
  LockClosedIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  totalPrice: number;
  finalPrice: number;
  discount: number;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isPublic: boolean;
  salesCount: number;
  revenue: number;
  viewCount: number;
  totalItems: number;
  individualTotal: number;
  savings: number;
  savingsPercentage: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  moduleItems?: Array<{
    module: {
      id: number;
      title: string;
      description?: string;
      price: number;
      isFree: boolean;
      course: {
        id: number;
        title: string;
        category: { name: string };
      };
    };
  }>;
  courseItems?: Array<{
    course: {
      id: number;
      title: string;
      description?: string;
      price: number;
      isPaid: boolean;
      imageUrl?: string;
      category: { name: string };
    };
  }>;
  createdAt: string;
  userOwnsItems?: boolean;
  isPurchased?: boolean;
}

export default function BundleDetailPage() {
  const params = useParams();
  const bundleId = params.id as string;
  
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'contents' | 'creator'>('overview');

  useEffect(() => {
    if (bundleId) {
      fetchBundleDetails();
    }
  }, [bundleId]);

  const fetchBundleDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bundles/${bundleId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Bundle Details:', data);
        setBundle(data.bundle);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load bundle details');
      }
    } catch (error) {
      console.error('Error fetching bundle details:', error);
      toast.error('Failed to load bundle details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!bundle) return;
    
    setPurchaseLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/bundles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId: bundle.id }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bundle purchased successfully!');
        fetchBundleDetails(); // Refresh to show purchased state
      } else {
        toast.error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Something went wrong');
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading bundle details...</span>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Bundle Not Found</h2>
          <p className="text-gray-400 mb-6">The bundle you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/shop/bundles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            Browse All Bundles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/shop/bundles" className="hover:text-white transition-colors">Bundle Marketplace</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-white">{bundle.name}</span>
        </div>

        {/* Bundle Header */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bundle Preview */}
            <div className="lg:col-span-1">
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 aspect-video mb-6">
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBagIcon className="w-20 h-20 text-white/50" />
                </div>
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-xl rounded-xl px-4 py-2">
                  <div className="text-2xl font-bold text-white">
                    ${bundle.finalPrice.toFixed(2)}
                  </div>
                  {bundle.savings > 0 && (
                    <div className="text-sm text-green-400">
                      {bundle.savingsPercentage}% off
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="space-y-4">
                {bundle.isPurchased ? (
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/20 px-4 py-3 rounded-xl">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-semibold">Bundle Purchased</span>
                  </div>
                ) : bundle.userOwnsItems ? (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <InformationCircleIcon className="w-5 h-5" />
                      <span className="font-semibold">Already Own Content</span>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      You already own some items in this bundle.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchaseLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {purchaseLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-6 h-6" />
                        Purchase Bundle - ${bundle.finalPrice.toFixed(2)}
                      </>
                    )}
                  </button>
                )}

                {/* Bundle Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{bundle.salesCount}</p>
                    <p className="text-sm text-gray-400">Sales</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">{bundle.viewCount}</p>
                    <p className="text-sm text-gray-400">Views</p>
                  </div>
                </div>

                {/* Value Proposition */}
                {bundle.savings > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-green-400 font-bold text-lg mb-1">
                        Save ${bundle.savings.toFixed(2)}
                      </p>
                      <p className="text-green-300 text-sm">
                        Buy individually: ${bundle.individualTotal.toFixed(2)}
                      </p>
                      <p className="text-green-300 text-sm">
                        Bundle price: ${bundle.finalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bundle Information */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {bundle.type} Bundle
                </span>
                
                {bundle.isFeatured && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-full text-sm font-bold">
                    <SparklesIcon className="w-4 h-4" />
                    <span>Featured</span>
                  </div>
                )}
                
                {bundle.isPopular && (
                  <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-full text-sm font-bold">
                    <StarIcon className="w-4 h-4" />
                    <span>Popular</span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{bundle.name}</h1>
              {bundle.description && (
                <p className="text-gray-300 text-lg leading-relaxed mb-6">{bundle.description}</p>
              )}

              {/* Bundle Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FolderIcon className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Items</p>
                      <p className="text-white font-bold">{bundle.totalItems}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Value</p>
                      <p className="text-white font-bold">${bundle.individualTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Students</p>
                      <p className="text-white font-bold">{bundle.salesCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {bundle.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{bundle.user.name}</h4>
                      {bundle.user.role === 'ADMIN' && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                          Verified Creator
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">Bundle Creator</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    Created {new Date(bundle.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <InformationCircleIcon className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('contents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'contents'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <FolderIcon className="w-4 h-4" />
            Contents ({bundle.totalItems})
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'creator'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <AcademicCapIcon className="w-4 h-4" />
            Creator
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">What's Included</h2>
                <p className="text-gray-300 leading-relaxed">
                  This comprehensive {bundle.type.toLowerCase()} bundle provides you with access to {bundle.totalItems} carefully selected {bundle.type === 'COURSE' ? 'courses' : 'modules'} designed to accelerate your learning journey.
                </p>
              </div>

              {/* Value Proposition */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Why Choose This Bundle?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">Save Money</p>
                      <p className="text-gray-400 text-sm">Get {bundle.savingsPercentage}% off compared to individual purchases</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                    <BookOpenIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">Comprehensive Learning</p>
                      <p className="text-gray-400 text-sm">Structured curriculum across {bundle.totalItems} {bundle.type === 'COURSE' ? 'courses' : 'modules'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                    <ClockIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">Self-Paced</p>
                      <p className="text-gray-400 text-sm">Learn at your own pace with lifetime access</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                    <CheckCircleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">Expert Content</p>
                      <p className="text-gray-400 text-sm">Created by {bundle.user.role === 'ADMIN' ? 'verified' : 'experienced'} instructors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contents' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Bundle Contents</h2>
              <div className="space-y-4">
                {bundle.type === 'COURSE' && bundle.courseItems ? (
                  bundle.courseItems.map((item, index) => (
                    <div key={item.course.id} className="border border-white/10 rounded-xl p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          {item.course.imageUrl ? (
                            <img
                              src={item.course.imageUrl}
                              alt={item.course.title}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <BookOpenIcon className="w-8 h-8 text-white/50" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{item.course.title}</h3>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                              {item.course.category.name}
                            </span>
                          </div>
                          
                          {item.course.description && (
                            <p className="text-gray-400 mb-4">{item.course.description}</p>
                          )}
                          
                          <div className="flex items-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              <span>${item.course.price.toFixed(2)} value</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : bundle.moduleItems ? (
                  bundle.moduleItems.map((item, index) => (
                    <div key={item.module.id} className="border border-white/10 rounded-xl p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FolderIcon className="w-8 h-8 text-white/50" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{item.module.title}</h3>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                              {item.module.course.category.name}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-2">
                            From course: <span className="text-blue-400">{item.module.course.title}</span>
                          </p>
                          
                          {item.module.description && (
                            <p className="text-gray-400 mb-4">{item.module.description}</p>
                          )}
                          
                          <div className="flex items-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              <span>{item.module.isFree ? 'Free' : `$${item.module.price.toFixed(2)} value`}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : null}
              </div>
            </div>
          )}

          {activeTab === 'creator' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Meet the Creator</h2>
              <div className="bg-white/5 rounded-xl p-8">
                <div className="flex items-start gap-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-3xl">
                      {bundle.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-3xl font-bold text-white">{bundle.user.name}</h3>
                      {bundle.user.role === 'ADMIN' && (
                        <span className="px-4 py-2 bg-orange-500/20 text-orange-400 text-sm rounded-full font-semibold">
                          Verified Creator
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      An experienced educator and content creator passionate about sharing knowledge and helping students achieve their learning goals through carefully curated educational content.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-400">Bundle Creator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-green-400" />
                        <span className="text-gray-400">{bundle.salesCount} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-400">Member since {new Date(bundle.createdAt).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
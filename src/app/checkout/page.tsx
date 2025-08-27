"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCardIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  duration?: number;
  instructor?: string;
  category?: { name: string };
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  finalPrice: number;
  totalPrice: number;
  courseItems: Array<{
    course: {
      id: number;
      title: string;
      price: number;
      description: string;
      category?: { name: string };
    };
  }>;
}

interface DiscountInfo {
  code: string;
  discountAmount: number;
  finalAmount: number;
  originalAmount: number;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const [item, setItem] = useState<Course | Bundle | null>(null);
  const [itemType, setItemType] = useState<'course' | 'bundle' | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const courseId = searchParams.get('courseId');
  const bundleId = searchParams.get('bundleId');

  useEffect(() => {
    if (!user?.token) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!courseId && !bundleId) {
      setError('No item selected');
      setLoading(false);
      return;
    }

    if (courseId) {
      fetchCourse();
      setItemType('course');
    } else if (bundleId) {
      fetchBundle();
      setItemType('bundle');
    }
  }, [courseId, bundleId, user, router]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Course not found');
      }

      const data = await response.json();
      setItem(data);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBundle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bundles/${bundleId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Bundle not found');
      }

      const data = await response.json();
      setItem(data);
    } catch (err) {
      console.error('Error fetching bundle:', err);
      setError('Failed to load bundle details');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discounts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          code: couponCode,
          courseId: itemType === 'course' ? courseId : undefined,
          bundleId: itemType === 'bundle' ? bundleId : undefined,
        }),
      });

      const data = await response.json();
      console.log('Coupon validation response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid coupon code');
      }

      setAppliedDiscount({
        code: data.data.code,
        discountAmount: data.data.discountAmount,
        finalAmount: data.data.finalAmount,
        originalAmount: data.data.originalAmount,
      });
      toast.success(`Coupon ${data.data.code} applied! Saved $${data.data.discountAmount.toFixed(2)}`);
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply coupon');
      setAppliedDiscount(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const calculateTotal = () => {
    if (!item) return 0;
    const price = itemType === 'course' ? (item as Course).price : (item as Bundle).finalPrice;
    return appliedDiscount ? appliedDiscount.finalAmount : price;
  };

  const handleCheckout = async () => {
    if (!item || !user?.token) {
      toast.error('Please log in and select an item');
      return;
    }

    setProcessing(true);

    try {
      const endpoint = itemType === 'course' ? '/api/payment/checkout' : '/api/bundles/purchase';
      const body = itemType === 'course' 
        ? { courseId: (item as Course).id, couponCode: appliedDiscount?.code || '' }
        : { bundleId: (item as Bundle).id, couponCode: appliedDiscount?.code || '' };

      console.log('Initiating checkout:', { itemId: (item as any).id, couponCode: appliedDiscount?.code });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Checkout response:', data);

      if (!response.ok || !data.success) {
        if (data.message === 'You are already enrolled in this course' || data.message === 'You already own this bundle') {
          toast.info(data.message);
          router.push(data.redirectUrl || '/my-courses');
          return;
        }
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Free course/bundle or fully discounted
      if (!data.url && data.enrollment) {
        toast.success(`Successfully enrolled in ${itemType === 'course' ? 'the course' : 'the bundle'}!`);
        router.push(data.redirectUrl || '/my-courses');
        return;
      }

      // Paid course/bundle
      if (data.url && data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to initialize');
        }

        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      } else {
        throw new Error('Invalid response: Missing payment URL');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4 text-xl">⚠️ {error || 'Item not found'}</div>
          <button
            onClick={() => router.push('/categories')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CreditCardIcon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Checkout</h1>
                <p className="text-sm text-gray-400">Complete your {itemType === 'course' ? 'course' : 'bundle'} enrollment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCartIcon className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold">{itemType === 'course' ? 'Course Summary' : 'Bundle Summary'}</h2>
              </div>
              {itemType === 'course' ? (
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{(item as Course).title}</h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{(item as Course).description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {(item as Course).category && <span>{(item as Course).category!.name}</span>}
                      {(item as Course).duration && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>{(item as Course).duration} hours</span>
                          </div>
                        </>
                      )}
                      {(item as Course).instructor && (
                        <>
                          <span>•</span>
                          <span>by {(item as Course).instructor}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">${(item as Course).price.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">One-time payment</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <ShoppingCartIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{(item as Bundle).name}</h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{(item as Bundle).description || 'A curated collection of courses'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">${(item as Bundle).finalPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-400">One-time payment</div>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Included Courses:</h4>
                    {(item as Bundle).courseItems.map(({ course }) => (
                      <div key={course.id} className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <BookOpenIcon className="w-4 h-4 text-blue-400" />
                        <span>{course.title} (${course.price.toFixed(2)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">What you'll get:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">{itemType === 'course' ? 'Lifetime access to course content' : 'Lifetime access to all bundle courses'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Downloadable resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Course community access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Certificate of completion {itemType === 'bundle' ? 'for each course' : ''}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-blue-400" />
                Apply Coupon
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={processing}
                />
                {appliedDiscount ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    disabled={processing}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    disabled={processing}
                  >
                    Apply
                  </button>
                )}
              </div>
              {appliedDiscount && (
                <div className="mt-4 text-sm text-green-400">
                  Coupon {appliedDiscount.code} applied! Saved ${appliedDiscount.discountAmount.toFixed(2)}.
                </div>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Original Price:</span>
                  <span>${(appliedDiscount?.originalAmount || (itemType === 'course' ? (item as Course).price : (item as Bundle).finalPrice)).toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedDiscount.code}):</span>
                    <span>-${appliedDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-semibold pt-2 border-t border-gray-600">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={processing}
                className={`mt-6 w-full py-3 rounded-lg font-medium transition-colors ${
                  processing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } text-white flex items-center justify-center gap-2`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
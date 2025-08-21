//frontend/src/app/checkout/page.tsx

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
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import DiscountValidator from '@/components/checkout/DiscountValidator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  duration?: number;
  instructor?: string;
  category?: {
    name: string;
  };
}

interface DiscountInfo {
  code: string;
  discountAmount: number;
  finalAmount: number;
}

export default function CheckoutPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    if (!user?.token) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!courseId) {
      router.push('/categories');
      return;
    }

    fetchCourse();
  }, [courseId, user, router]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Course not found or unavailable');
      }

      const data = await response.json();
      setCourse(data);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountApplied = (discountInfo: DiscountInfo | null) => {
    setAppliedDiscount(discountInfo);
  };

  const calculateTotal = () => {
    if (!course) return 0;
    return appliedDiscount ? appliedDiscount.finalAmount : course.price;
  };

  const handleCheckout = async () => {
    if (!course || !user?.token) return;

    setProcessing(true);

    try {
      const response = await fetch('http://localhost:5000/api/courses/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: course.id,
          discountCode: appliedDiscount?.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Enrollment failed');
      }

      toast.success('🎉 Successfully enrolled in course!');
      router.push(`/courses/${course.id}/modules?enrolled=true`);
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4 text-xl">⚠️ {error || 'Course not found'}</div>
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
                <p className="text-sm text-gray-400">Complete your course enrollment</p>
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
                <h2 className="text-xl font-semibold">Course Summary</h2>
              </div>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <BookOpenIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {course.category && <span>{course.category.name}</span>}
                    {course.duration && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{course.duration} hours</span>
                        </div>
                      </>
                    )}
                    {course.instructor && (
                      <>
                        <span>•</span>
                        <span>by {course.instructor}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${course.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">One-time payment</div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">What you'll get:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Lifetime access to course content</span>
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
                  <span className="text-gray-300">Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <DiscountValidator
              originalAmount={course.price}
              itemId={course.id}
              itemType="COURSE"
              onDiscountApplied={handleDiscountApplied}
            />
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Course Price:</span>
                  <span>${course.price.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedDiscount.code}):</span>
                    <span>-${appliedDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                {appliedDiscount && (
                  <div className="text-center text-sm text-green-400">
                    You saved ${appliedDiscount.discountAmount.toFixed(2)}!
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing || !user?.token}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-5 h-5" />
                  Enroll Now - ${calculateTotal().toFixed(2)}
                </>
              )}
            </button>
            <div className="text-xs text-gray-400 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Secure checkout</span>
              </div>
              <p>Your payment is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
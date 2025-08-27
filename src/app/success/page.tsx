'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Play, 
  BookOpen, 
  Award, 
  Calendar,
  ArrowRight,
  Gift,
  Sparkles,
  Trophy,
  Share2,
  Infinity
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
  instructor?: string;
  duration?: string;
  modules?: number;
  rating?: number;
};

type Bundle = {
  id: number;
  name: string;
  description?: string;
  finalPrice: number;
  courseItems: Array<{
    course: Course;
  }>;
};

type OrderItem = {
  id: number;
  courseId?: number;
  bundleId?: number;
  price: number;
  course?: Course;
  bundle?: Bundle;
};

type Order = {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

type PaymentDetails = {
  transactionId: string;
  amount: number;
  currency: string;
  order: Order;
  paymentDate: string;
};

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const courseId = searchParams.get('course_id');
    const bundleId = searchParams.get('bundle_id');
    const orderId = searchParams.get('order_id');

    if (!sessionId) {
      setError('Invalid payment session - missing session ID');
      setLoading(false);
      return;
    }

    const verifyPaymentAndGetDetails = async () => {
      try {
        console.log('Verifying payment with:', { sessionId, courseId, bundleId, orderId });

        // Verify payment session
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId,
            courseId: courseId ? parseInt(courseId) : undefined,
            bundleId: bundleId ? parseInt(bundleId) : undefined,
            orderId: orderId ? parseInt(orderId) : undefined
          }),
          credentials: 'include',
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error', details: '' }));
          throw new Error(errorData.error || errorData.details || `HTTP ${res.status}: Payment verification failed`);
        }

        const data = await res.json();
        console.log('Payment verification response:', data);

        if (data.success) {
          let orderData: Order | undefined;

          // If order is not in the response, fetch it separately
          if (!data.order && orderId) {
            console.log('Fetching order details for orderId:', orderId);
            const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });

            if (!orderRes.ok) {
              const errorData = await orderRes.json().catch(() => ({ error: 'Unknown error' }));
              throw new Error(errorData.error || `Failed to fetch order details for Order ID ${orderId}`);
            }

            orderData = await orderRes.json();
            console.log('Order details response:', orderData);
          } else {
            orderData = data.order;
          }

          if (!orderData) {
            throw new Error('Order details not found');
          }

          // Construct minimal payment details
          setPaymentDetails({
            transactionId: sessionId,
            amount: orderData.totalAmount || 0,
            currency: 'USD',
            order: {
              id: orderData.id,
              userId: orderData.userId,
              status: orderData.status || 'COMPLETED',
              totalAmount: orderData.totalAmount || 0,
              createdAt: orderData.createdAt || new Date().toISOString(),
              items: orderData.items || [{
                id: 1,
                courseId: courseId ? parseInt(courseId) : undefined,
                bundleId: bundleId ? parseInt(bundleId) : undefined,
                price: orderData.totalAmount || 0,
                course: courseId ? {
                  id: parseInt(courseId),
                  title: 'Course Title', // Placeholder, fetch if needed
                  description: 'Course Description',
                  price: orderData.totalAmount || 0,
                  category: { id: 1, name: 'General' }
                } : undefined,
                bundle: bundleId ? {
                  id: parseInt(bundleId),
                  name: 'Bundle Title',
                  finalPrice: orderData.totalAmount || 0,
                  courseItems: []
                } : undefined
              }]
            },
            paymentDate: orderData.createdAt || new Date().toISOString()
          });

          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
          
          toast.success(data.message || 'Payment successful! You are now enrolled! 🎉');

          // Auto-redirect to course modules or my-courses after 2 seconds
          setTimeout(() => {
            const redirectPath = courseId 
              ? `/courses/${courseId}/modules`
              : '/my-courses';
            console.log('Redirecting to:', redirectPath);
            router.push(redirectPath);
          }, 2000);

        } else {
          throw new Error(data.error || data.message || 'Payment verification failed');
        }

      } catch (err) {
        console.error('Error verifying payment:', err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to verify payment. Please contact support if payment was deducted.';
        setError(`${errorMessage} (Order ID: ${orderId || 'Unknown'})`);
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentAndGetDetails();
  }, [searchParams, router]);

  const handleShareSuccess = () => {
    if (paymentDetails && paymentDetails.order.items.length > 0) {
      const item = paymentDetails.order.items[0];
      const isCourse = !!item.course;
      const title = isCourse ? item.course!.title : item.bundle!.name;
      const id = isCourse ? item.course!.id : item.bundle!.id;
      
      if (navigator.share) {
        navigator.share({
          title: `I just enrolled in a new ${isCourse ? 'course' : 'bundle'}!`,
          text: `I just started learning "${title}" - excited to dive in!`,
          url: window.location.origin + `/${isCourse ? 'courses' : 'bundles'}/${id}`
        }).catch(() => {
          navigator.clipboard.writeText(`I just started learning "${title}" at ${window.location.origin}/${isCourse ? 'courses' : 'bundles'}/${id}`);
          toast.success('Link copied to clipboard!');
        });
      } else {
        navigator.clipboard.writeText(`I just started learning "${title}" at ${window.location.origin}/${isCourse ? 'courses' : 'bundles'}/${id}`)
          .then(() => {
            toast.success('Link copied to clipboard!');
          })
          .catch(() => {
            toast.error('Failed to copy link to clipboard');
          });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing your enrollment...</h2>
          <p className="text-gray-400">Please wait while we verify your payment</p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-red-500/20 to-pink-500/20 blur-[150px] rounded-full animate-pulse-slow"></div>
        
        <div className="text-center max-w-md relative z-10">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <CheckCircle2 className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Payment Verification Issue</h1>
          <p className="text-gray-300 mb-8">
            {error?.includes('missing session ID') 
              ? 'Payment session information is missing. Please try accessing this page from a valid payment completion.'
              : `${error}. If your payment was processed, please contact support with your transaction details.`}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/my-courses')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 w-full"
            >
              Check My Courses
            </button>
            <button
              onClick={() => router.push('/categories')}
              className="bg-white/10 border border-white/20 hover:bg-white/20 px-6 py-3 rounded-xl transition-all duration-300 w-full"
            >
              Browse More Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mainItem = paymentDetails.order.items[0];
  const isCourse = !!mainItem.course;
  const totalItems = paymentDetails.order.items.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[140px] rounded-full animate-pulse-slower"></div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${3 + Math.random() * 1}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30 animate-scale-in">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-4">
              🎉 Payment Successful!
            </h1>
            <p className="text-2xl text-gray-300 mb-2">Welcome to your learning journey!</p>
            <p className="text-gray-400">
              {totalItems === 1 ? `You are now enrolled in your ${isCourse ? 'course' : 'bundle'}` : `You are now enrolled in ${totalItems} items`}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Enrollment Confirmed
              </h2>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Order ID</p>
                <p className="text-white font-mono text-sm">#{paymentDetails.order.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              {paymentDetails.order.items.map((item) => (
                <div key={item.id} className="border border-white/10 rounded-xl p-6 bg-white/5">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-blue-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{isCourse ? item.course!.title : item.bundle!.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{isCourse ? item.course!.description : item.bundle!.description || 'A curated collection of courses'}</p>
                      {isCourse ? (
                        <>
                          <p className="text-gray-400">
                            Category: <span className="text-white">{item.course!.category.name}</span>
                          </p>
                          <p className="text-gray-400">
                            Instructor: <span className="text-white">{item.course!.instructor || 'Dr Waleed'}</span>
                          </p>
                        </>
                      ) : (
                        <div className="mt-2">
                          <p className="text-gray-400 text-sm mb-2">Included Courses:</p>
                          {item.bundle!.courseItems.map(({ course }) => (
                            <div key={course.id} className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                              <BookOpen className="w-4 h-4 text-blue-400" />
                              <span>{course.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        {paymentDetails.currency} {item.price.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Paid on {new Date(paymentDetails.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-white">Total Amount Paid</span>
                <span className="text-green-400">
                  {paymentDetails.currency} {paymentDetails.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{totalItems}</p>
                <p className="text-gray-400 text-sm">{totalItems === 1 ? (isCourse ? 'Course' : 'Bundle') : 'Items'} Enrolled</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Infinity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">Lifetime</p>
                <p className="text-gray-400 text-sm">Access</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">Certificate</p>
                <p className="text-gray-400 text-sm">Upon Completion</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                href={totalItems === 1 ? (isCourse ? `/courses/${mainItem.course!.id}/modules` : '/my-courses') : '/my-courses'}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {totalItems === 1 && isCourse ? 'Start Learning Now' : 'View My Courses'}
              </Link>
              
              <button
                onClick={handleShareSuccess}
                className="px-6 py-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Success
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              What's Next?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Start Learning</h4>
                    <p className="text-gray-400 text-sm">Access your course content and begin with the first module.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Track Progress</h4>
                    <p className="text-gray-400 text-sm">Monitor your learning journey in your personal dashboard.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-400 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Get Support</h4>
                    <p className="text-gray-400 text-sm">Join our community and get help from instructors and peers.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-yellow-400 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Earn Certificate</h4>
                    <p className="text-gray-400 text-sm">Complete the course to receive your certificate of completion.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/my-courses"
              className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 text-center group"
            >
              <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-2">My Courses</h4>
              <p className="text-gray-400 text-sm mb-4">View all your enrolled courses and progress</p>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <span className="text-sm">View Courses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 text-center group"
            >
              <Trophy className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-2">Dashboard</h4>
              <p className="text-gray-400 text-sm mb-4">Track your learning statistics and achievements</p>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <span className="text-sm">View Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/categories"
              className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 text-center group"
            >
              <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-2">Explore More</h4>
              <p className="text-gray-400 text-sm mb-4">Discover more amazing courses to expand your skills</p>
              <div className="flex items-center justify-center gap-2 text-purple-400">
                <span className="text-sm">Browse Courses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
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
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
        .animate-confetti { animation: confetti 3s linear forwards; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </main>
  );
}
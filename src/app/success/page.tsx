// app/success/page.tsx
'use client';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Download, 
  Play, 
  BookOpen, 
  Award, 
  Calendar,
  ArrowRight,
  Star,
  Gift,
  Sparkles,
  Trophy,
  Share2,
  Heart,
  Clock
} from 'lucide-react';
import Link from 'next/link';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: {
    name: string;
  };
  instructor?: string;
  duration?: string;
  modules?: number;
  rating?: number;
};

type PaymentDetails = {
  transactionId: string;
  amount: number;
  currency: string;
  courseId: number;
  course: Course;
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
    const orderId = searchParams.get('order_id');

    if (!sessionId) {
      setError('Invalid payment session - missing session ID');
      setLoading(false);
      return;
    }

    // Verify payment and get order details
    const verifyPaymentAndGetDetails = async () => {
      try {
        // Verify the Stripe session and get order details
        const res = await fetch('http://localhost:5000/api/payment/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId,
            courseId: courseId ? parseInt(courseId) : undefined
          }),
          credentials: 'include',
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Payment verification failed');
        }

        const data = await res.json();
        
        if (data.success && data.course) {
          setPaymentDetails({
            transactionId: data.transactionId || sessionId,
            amount: data.amount,
            currency: data.currency || 'PKR',
            courseId: data.course.id,
            course: {
              ...data.course,
              instructor: data.course.instructor || 'Expert Instructor',
              duration: '24h',
              modules: 45,
              rating: 4.8
            },
            paymentDate: new Date().toISOString()
          });
          
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
          
          toast.success('Payment successful! You are now enrolled! 🎉');
        } else {
          throw new Error(data.error || 'Payment verification failed');
        }

      } catch (err: any) {
        console.error('Error verifying payment:', err);
        setError(err.message || 'Failed to verify payment. Please contact support if payment was deducted.');
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentAndGetDetails();
  }, [searchParams]);

  const handleShareSuccess = () => {
    if (navigator.share && paymentDetails) {
      navigator.share({
        title: 'I just enrolled in a new course!',
        text: `I just started learning "${paymentDetails.course.title}" - excited to dive in!`,
        url: window.location.origin + `/courses/${paymentDetails.course.id}`
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`I just started learning "${paymentDetails?.course.title}" at ${window.location.origin}/courses/${paymentDetails?.course.id}`);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-xl">Processing your enrollment...</span>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <CheckCircle2 className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Payment Error</h1>
          <p className="text-gray-300 mb-8">{error || 'Something went wrong with your payment.'}</p>
          <button
            onClick={() => router.push('/categories')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[140px] rounded-full animate-pulse-slower"></div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
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
              🎉 Congratulations!
            </h1>
            <p className="text-2xl text-gray-300 mb-2">Your enrollment was successful!</p>
            <p className="text-gray-400">Welcome to your learning journey</p>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Enrollment Confirmed
              </h2>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Transaction ID</p>
                <p className="text-white font-mono text-sm">{paymentDetails.transactionId.substring(0, 16)}...</p>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl p-6 bg-white/5 mb-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{paymentDetails.course.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{paymentDetails.course.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{paymentDetails.course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{paymentDetails.course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{paymentDetails.course.modules} modules</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-300">{paymentDetails.course.category.name}</span>
                  </div>

                  <p className="text-gray-400">Instructor: <span className="text-white">{paymentDetails.course.instructor}</span></p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">${paymentDetails.amount}</p>
                  <p className="text-gray-400 text-sm">Paid on {new Date(paymentDetails.paymentDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{paymentDetails.course.modules}</p>
                <p className="text-gray-400 text-sm">Learning Modules</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{paymentDetails.course.duration}</p>
                <p className="text-gray-400 text-sm">Total Content</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">Certificate</p>
                <p className="text-gray-400 text-sm">Upon Completion</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/courses/${paymentDetails.course.id}/modules`}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Learning Now
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

          {/* Next Steps */}
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
                    <h4 className="font-semibold text-white mb-1">Access Your Course</h4>
                    <p className="text-gray-400 text-sm">Start with the first module and progress at your own pace.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Join the Community</h4>
                    <p className="text-gray-400 text-sm">Connect with fellow learners and get support.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-400 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Track Your Progress</h4>
                    <p className="text-gray-400 text-sm">Monitor your learning journey in your dashboard.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-yellow-400 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Earn Your Certificate</h4>
                    <p className="text-gray-400 text-sm">Complete the course to receive your certificate.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/my-courses"
              className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 text-center group"
            >
              <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-white mb-2">My Courses</h4>
              <p className="text-gray-400 text-sm mb-4">View all your enrolled courses</p>
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
              <p className="text-gray-400 text-sm mb-4">Track your learning progress</p>
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
              <p className="text-gray-400 text-sm mb-4">Discover more amazing courses</p>
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
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play, 
  Calendar,
  Target,
  ChevronRight,
  Plus,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Gift,
  ShoppingCart,
  GraduationCap,
  CurrencyDollarIcon,
  EyeIcon,
  StarIcon,
  Home,
  Settings,
  BookOpenIcon,
  AcademicCapIcon,
  FolderIcon,
  Sparkles
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
};

type Enrollment = {
  id: number;
  course: Course;
  enrolledAt?: string;
  progress?: number;
  lastAccessed?: string;
  completedModules?: number;
  totalModules?: number;
  paymentTransactionId?: string;
  enrollmentType?: 'enrolled' | 'purchased';
};

type BundlePurchase = {
  id: number;
  bundleId: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  finalPrice: number;
  itemCount: number;
  totalItems: number;
  createdAt: string;
};

type User = {
  name: string;
  email: string;
  role?: string;
};

type Stats = {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  enrolledCourses: number;
  purchasedCourses: number;
  bundlePurchases: number;
  totalInvestment: number;
  totalBundleItems: number;
};

type WeeklyGoal = {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [bundlePurchases, setBundlePurchases] = useState<BundlePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    enrolledCourses: 0,
    purchasedCourses: 0,
    bundlePurchases: 0,
    totalInvestment: 0,
    totalBundleItems: 0
  });
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([
    { id: '1', label: 'Complete lessons', target: 5, current: 0, unit: 'lessons' },
    { id: '2', label: 'Study time', target: 10, current: 0, unit: 'hours' },
    { id: '3', label: 'Course progress', target: 2, current: 0, unit: 'courses' }
  ]);
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch('http://localhost:5000/api/users/me', {
          credentials: 'include',
        });
        
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        
        const userData = await userRes.json();
        setUser(userData.user || userData);

        // Fetch enrolled courses (using same endpoint as my-courses)
        console.log('🔄 Fetching enrolled courses with progress...');
        const courseRes = await fetch('http://localhost:5000/api/enrollments/my-courses', {
          credentials: 'include',
        });
        
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          console.log('✅ Course data loaded:', courseData);
          setEnrollments(courseData);
        } else {
          console.error('❌ Failed to fetch course data:', courseRes.status);
          setEnrollments([]);
        }

        // Fetch bundle purchases
        try {
          const bundleRes = await fetch('http://localhost:5000/api/bundles?view=purchased', {
            credentials: 'include'
          });

          if (bundleRes.ok) {
            const bundleData = await bundleRes.json();
            console.log('📦 Bundle purchases loaded:', bundleData);
            setBundlePurchases(bundleData.bundles || []);
          } else {
            console.log('No bundle purchases found');
            setBundlePurchases([]);
          }
        } catch (bundleError) {
          console.log('Bundle fetch error (non-critical):', bundleError);
          setBundlePurchases([]);
        }

      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Update stats when data changes
  useEffect(() => {
    if (enrollments.length > 0 || bundlePurchases.length > 0) {
      // Separate courses by type
      const enrolledCourses = enrollments.filter(enrollment => 
        enrollment.enrollmentType === 'enrolled' || (!enrollment.paymentTransactionId && enrollment.course.price === 0)
      );

      const purchasedCourses = enrollments.filter(enrollment => 
        enrollment.enrollmentType === 'purchased' || (enrollment.paymentTransactionId || enrollment.course.price > 0)
      );

      const totalCourses = enrollments.length;
      const completed = enrollments.filter((e: Enrollment) => (e.progress || 0) >= 100).length;
      const inProgress = enrollments.filter((e: Enrollment) => (e.progress || 0) > 0 && (e.progress || 0) < 100).length;
      
      // Calculate bundle stats
      const bundleInvestment = bundlePurchases.reduce((sum, bundle) => sum + bundle.finalPrice, 0);
      const courseInvestment = purchasedCourses.reduce((sum, enrollment) => sum + enrollment.course.price, 0);
      const totalBundleItems = bundlePurchases.reduce((sum, bundle) => sum + bundle.totalItems, 0);
      
      setStats({
        totalCourses,
        completedCourses: completed,
        inProgressCourses: inProgress,
        enrolledCourses: enrolledCourses.length,
        purchasedCourses: purchasedCourses.length,
        bundlePurchases: bundlePurchases.length,
        totalInvestment: bundleInvestment + courseInvestment,
        totalBundleItems
      });

      // Update weekly goals based on real data
      updateWeeklyGoals(enrollments);
      updateWeeklyActivity(enrollments);
    }
  }, [enrollments, bundlePurchases]);

  const updateWeeklyGoals = (enrollments: Enrollment[]) => {
    const completedThisWeek = enrollments.filter(e => (e.progress || 0) >= 100).length;
    const inProgressThisWeek = enrollments.filter(e => (e.progress || 0) > 0).length;
    
    setWeeklyGoals(prev => prev.map(goal => {
      switch (goal.id) {
        case '1': // Lessons completed
          return { ...goal, current: Math.min(completedThisWeek * 3, goal.target) };
        case '2': // Study time
          return { ...goal, current: Math.min(inProgressThisWeek * 2, goal.target) };
        case '3': // Course progress
          return { ...goal, current: Math.min(inProgressThisWeek, goal.target) };
        default:
          return goal;
      }
    }));
  };

  const updateWeeklyActivity = (enrollments: Enrollment[]) => {
    const hasActivity = enrollments.length > 0;
    const activity = Array(7).fill(false).map((_, index) => {
      return hasActivity && index < Math.min(4, enrollments.length);
    });
    setWeeklyActivity(activity);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-purple-500';
  };

  const getGoalProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-purple-500';
  };

  const updateGoalProgress = (goalId: string, increment: number) => {
    setWeeklyGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.min(goal.current + increment, goal.target) }
        : goal
    ));
  };

  const formatLastAccessed = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-xl">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
          <p className="text-gray-400 mb-6">Please log in to access your dashboard</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] px-6 py-8 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[150px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15 blur-[120px] rounded-full animate-pulse-slower"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
                {getGreeting()}, {user.name}! 👋
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Ready to continue your learning journey?</p>
            </div>
            
            {/* Enhanced Navigation Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/categories"
                className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all duration-300 group"
                title="Browse Courses"
              >
                <BookOpen className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
              </Link>
              
              <Link
                href="/shop/bundles"
                className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all duration-300 group"
                title="Browse Bundles"
              >
                <ShoppingBag className="w-5 h-5 text-green-400 group-hover:text-green-300" />
              </Link>
              
              <Link
                href="/bundles"
                className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-all duration-300 group"
                title="Bundle Studio"
              >
                <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
              </Link>
              
              <Link
                href="/profile"
                className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 group"
                title="Profile Settings"
              >
                <Users className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.totalCourses}</h3>
            <p className="text-gray-400 text-sm">Total Courses</p>
            <div className="text-xs text-gray-500 mt-1">
              {stats.enrolledCourses} enrolled • {stats.purchasedCourses} purchased
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.completedCourses}</h3>
            <p className="text-gray-400 text-sm">Completed</p>
            <div className="text-xs text-gray-500 mt-1">
              {stats.inProgressCourses} in progress
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
              </div>
              <Gift className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.bundlePurchases}</h3>
            <p className="text-gray-400 text-sm">Bundle Purchases</p>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalBundleItems} items included
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
                <GraduationCap className="w-6 h-6 text-orange-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">${stats.totalInvestment.toFixed(0)}</h3>
            <p className="text-gray-400 text-sm">Total Investment</p>
            <div className="text-xs text-gray-500 mt-1">
              Learning progress
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Play className="w-6 h-6 text-green-400" />
                  Continue Learning
                </h2>
                <Link
                  href="/my-courses"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No courses yet</h3>
                  <p className="text-gray-400 mb-6">Start your learning journey by enrolling in a course</p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => router.push('/categories')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Browse Courses
                    </button>
                    <button
                      onClick={() => router.push('/shop/bundles')}
                      className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Browse Bundles
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.slice(0, 4).map((enrollment) => {
                    const progress = enrollment.progress || 0;
                    const lastAccessed = formatLastAccessed(enrollment.lastAccessed);
                    const isPaid = enrollment.course.price > 0 || enrollment.paymentTransactionId;
                    
                    return (
                      <div
                        key={enrollment.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push(`/courses/${enrollment.course.id}/modules`)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {enrollment.course.title}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                isPaid ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {isPaid ? `$${enrollment.course.price}` : 'Free'}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {enrollment.course.category?.name} • Last accessed {lastAccessed}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-white">{Math.round(progress)}%</div>
                              <div className="text-xs text-gray-400">Complete</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-500`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {enrollments.length > 4 && (
                    <div className="text-center pt-4 border-t border-white/10">
                      <Link
                        href="/my-courses"
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 justify-center"
                      >
                        View {enrollments.length - 4} more courses
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bundle Purchases Quick View */}
            {bundlePurchases.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-green-400" />
                    Recent Bundle Purchases
                  </h2>
                  <Link
                    href="/my-courses?tab=bundles"
                    className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bundlePurchases.slice(0, 2).map((bundle) => (
                    <div
                      key={bundle.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push(`/bundles/${bundle.bundleId}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {bundle.type} Bundle
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      
                      <h3 className="text-white font-semibold mb-2 group-hover:text-green-300 transition-colors">
                        {bundle.name}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{bundle.totalItems} items</span>
                        <span className="text-green-400 font-bold">${bundle.finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Goals */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-red-400" />
                Weekly Goals
              </h2>
              
              <div className="space-y-4">
                {weeklyGoals.map((goal) => {
                  const progressPercentage = (goal.current / goal.target) * 100;
                  const progressWidth = Math.min(progressPercentage, 100);
                  
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{goal.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${getGoalProgressColor(goal.current, goal.target)} transition-all duration-500`}
                              style={{ width: `${progressWidth}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 min-w-[60px]">
                            {goal.current}/{goal.target} {goal.unit}
                          </span>
                        </div>
                      </div>
                      
                      {goal.current < goal.target && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => updateGoalProgress(goal.id, 1)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Mark +1 {goal.unit.slice(0, -1)}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Link
                  href="/categories"
                  className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl text-left hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 group block"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-blue-400" />
                    <span className="text-white group-hover:text-blue-300">Browse Courses</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                
                <Link
                  href="/shop/bundles"
                  className="w-full p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-left hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 group block"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-green-400" />
                    <span className="text-white group-hover:text-green-300">Browse Bundles</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                
                <Link
                  href="/bundles"
                  className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group block"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-white group-hover:text-purple-300">Bundle Studio</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                
                <Link
                  href="/my-courses"
                  className="w-full p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl text-left hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 group block"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-orange-400" />
                    <span className="text-white group-hover:text-orange-300">My Courses</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                
                <Link
                  href="/profile"
                  className="w-full p-3 bg-gradient-to-r from-gray-500/20 to-slate-500/20 border border-gray-500/30 rounded-xl text-left hover:from-gray-500/30 hover:to-slate-500/30 transition-all duration-300 group block"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-white group-hover:text-gray-300">Profile Settings</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Learning Calendar */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                This Week
              </h3>
              
              <div className="space-y-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{day}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      weeklyActivity[index] 
                        ? 'bg-green-500' 
                        : index === 3 
                        ? 'bg-blue-500 animate-pulse' 
                        : 'bg-gray-500'
                    }`}></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  {weeklyActivity.filter(Boolean).length} days active this week
                </p>
              </div>
            </div>

            {/* Learning Tips */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Learning Tips
              </h3>
              
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="text-gray-300 mb-2">💡 Study consistently</p>
                  <p className="text-gray-400 text-xs">Set aside 30 minutes daily for learning</p>
                </div>
                
                <div className="text-sm">
                  <p className="text-gray-300 mb-2">🎯 Set clear goals</p>
                  <p className="text-gray-400 text-xs">Break down complex topics into smaller chunks</p>
                </div>
                
                <div className="text-sm">
                  <p className="text-gray-300 mb-2">📝 Practice actively</p>
                  <p className="text-gray-400 text-xs">Take notes and complete all exercises</p>
                </div>
              </div>
            </div>
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
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
      `}</style>
    </main>
  );
}
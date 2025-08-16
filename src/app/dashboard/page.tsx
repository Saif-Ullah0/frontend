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
  Settings,
  PackageOpen,
  Crown,
  Star,
  DollarSign,
  BarChart3,
  ShoppingCart,
  GraduationCap,
  Bookmark,
  Gift,
  Sparkles
} from 'lucide-react';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  category?: {
    id: number;
    name: string;
  };
};

type Enrollment = {
  id: number;
  course: Course;
  progress?: number;
  lastAccessed?: string;
  completedModules?: number;
  totalModules?: number;
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0
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

        // Fetch enrolled courses
        const courseRes = await fetch('http://localhost:5000/api/enroll', {
          credentials: 'include',
        });
        
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setEnrollments(courseData);
          
          // Calculate real stats
          const totalCourses = courseData.length;
          const completed = courseData.filter((e: Enrollment) => (e.progress || 0) >= 100).length;
          const inProgress = courseData.filter((e: Enrollment) => (e.progress || 0) > 0 && (e.progress || 0) < 100).length;
          
          setStats({
            totalCourses,
            completedCourses: completed,
            inProgressCourses: inProgress
          });

          // Update weekly goals based on real data
          updateWeeklyGoals(courseData);
          updateWeeklyActivity(courseData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const updateWeeklyGoals = (enrollments: Enrollment[]) => {
    const completedThisWeek = enrollments.filter(e => (e.progress || 0) >= 100).length;
    const inProgressThisWeek = enrollments.filter(e => (e.progress || 0) > 0).length;
    
    setWeeklyGoals(prev => prev.map(goal => {
      switch (goal.id) {
        case '1': // Lessons completed
          return { ...goal, current: completedThisWeek * 3 }; // Assume 3 lessons per course
        case '2': // Study time
          return { ...goal, current: inProgressThisWeek * 2 }; // Assume 2 hours per active course
        case '3': // Course progress
          return { ...goal, current: inProgressThisWeek };
        default:
          return goal;
      }
    }));
  };

  const updateWeeklyActivity = (enrollments: Enrollment[]) => {
    // Generate activity based on enrollment data
    const hasActivity = enrollments.length > 0;
    const activity = Array(7).fill(false).map((_, index) => {
      // Show activity for first few days if user has enrollments
      return hasActivity && index < Math.min(3, enrollments.length);
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

  const isAdmin = user?.role === 'ADMIN';

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
              {isAdmin && (
                <div className="flex items-center gap-2 mt-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">Administrator</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Profile Button */}
              <button
                onClick={() => router.push('/profile')}
                className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
                title="Profile"
              >
                <Users className="w-5 h-5" />
              </button>
              
              {/* Admin Panel Button */}
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 transition-all duration-300"
                  title="Admin Panel"
                >
                  <Crown className="w-5 h-5 text-yellow-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.totalCourses}</h3>
            <p className="text-gray-400">Enrolled Courses</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.completedCourses}</h3>
            <p className="text-gray-400">Completed</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.inProgressCourses}</h3>
            <p className="text-gray-400">In Progress</p>
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
                <button
                  onClick={() => router.push('/my-courses')}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {enrollments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No courses yet</h3>
                  <p className="text-gray-400 mb-6">Start your learning journey by enrolling in a course</p>
                  <button
                    onClick={() => router.push('/categories')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.slice(0, 3).map((enrollment) => {
                    const progress = enrollment.progress || 0;
                    const lastAccessed = enrollment.lastAccessed || 'Recently';
                    
                    return (
                      <div
                        key={enrollment.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push(`/courses/${enrollment.course.id}/modules`)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {enrollment.course.title}
                            </h3>
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
                </div>
              )}
            </div>

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
                      
                      {/* Interactive buttons to update progress */}
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
                {/* Browse Courses */}
                <button
                  onClick={() => router.push('/categories')}
                  className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl text-left hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    <span className="text-white group-hover:text-blue-300">Browse Courses</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                
                {/* My Courses */}
                <button
                  onClick={() => router.push('/my-courses')}
                  className="w-full p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl text-left hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-green-400" />
                    <span className="text-white group-hover:text-green-300">My Courses</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                
                {/* Bundle Marketplace */}
                <button
                  onClick={() => router.push('/shop/bundles')}
                  className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-purple-400" />
                    <span className="text-white group-hover:text-purple-300">Bundle Store</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Bundle Studio */}
                <button
                  onClick={() => router.push('/bundles')}
                  className="w-full p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl text-left hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <PackageOpen className="w-5 h-5 text-orange-400" />
                    <span className="text-white group-hover:text-orange-300">Bundle Studio</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            {/* Admin Actions (if admin) */}
            {isAdmin && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Admin Panel
                </h3>
                
                <div className="space-y-3">
                  {/* Admin Dashboard */}
                  <button
                    onClick={() => router.push('/admin')}
                    className="w-full p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-left hover:bg-yellow-500/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-yellow-400" />
                      <span className="text-white group-hover:text-yellow-300">Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Bundle Management */}
                  <button
                    onClick={() => router.push('/admin/bundles')}
                    className="w-full p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl text-left hover:bg-orange-500/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-orange-400" />
                      <span className="text-white group-hover:text-orange-300">Bundle Management</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  {/* Course Management */}
                  <button
                    onClick={() => router.push('/admin/courses')}
                    className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-left hover:bg-blue-500/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-blue-400" />
                      <span className="text-white group-hover:text-blue-300">Course Management</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Profile & Settings */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Account
              </h3>
              
              <div className="space-y-3">
                {/* Profile */}
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-left hover:bg-blue-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-white group-hover:text-blue-300">Profile</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Purchases */}
                <button
                  onClick={() => router.push('/my-purchases')}
                  className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-left hover:bg-green-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-green-400" />
                    <span className="text-white group-hover:text-green-300">My Purchases</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Bookmarks */}
                <button
                  onClick={() => router.push('/bookmarks')}
                  className="w-full p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-left hover:bg-purple-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-5 h-5 text-purple-400" />
                    <span className="text-white group-hover:text-purple-300">Saved Items</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
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
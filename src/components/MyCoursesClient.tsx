'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseMaterialsWidget from '@/components/student/CourseMaterialsWidget';
import { 
  BookOpen, 
  Play, 
  Search, 
  Grid3X3, 
  List, 
  ChevronRight,
  Plus,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ShoppingCart,
  Gift
} from 'lucide-react';

type Course = {
  id: number;
  title: string;
  description: string;
  price: number; // 🆕 NEW: Include price
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
  paymentTransactionId?: string; // 🆕 NEW: To distinguish paid vs free
  enrollmentType?: 'enrolled' | 'purchased'; // 🆕 NEW: Course type
};

export default function MyCoursesClient() {
  const [allCourses, setAllCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'enrolled' | 'purchased'>('enrolled'); // 🆕 NEW: Tab state
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('🔄 Fetching enrolled courses with progress...');
        
        // 🆕 NEW: Fetch from updated endpoint that separates course types
        const res = await fetch('http://localhost:5000/api/enrollments/my-courses', {
          credentials: 'include',
        });

        if (!res.ok) {
          console.error('❌ Failed to fetch course data:', res.status);
          router.push('/login');
          return;
        }

        const data = await res.json();
        console.log('✅ Course data loaded:', data);
        setAllCourses(data);
      } catch (err) {
        console.error('❌ Error fetching courses:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  // 🆕 NEW: Separate courses by type
  const enrolledCourses = allCourses.filter(enrollment => 
    enrollment.enrollmentType === 'enrolled' || (!enrollment.paymentTransactionId && enrollment.course.price === 0)
  );

  const purchasedCourses = allCourses.filter(enrollment => 
    enrollment.enrollmentType === 'purchased' || (enrollment.paymentTransactionId || enrollment.course.price > 0)
  );

  // Get current courses based on active tab
  const currentCourses = activeTab === 'enrolled' ? enrolledCourses : purchasedCourses;

  const filteredCourses = currentCourses.filter(enrollment => {
    const matchesSearch = enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.course.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'in-progress') return matchesSearch && (enrollment.progress || 0) > 0 && (enrollment.progress || 0) < 100;
    if (selectedFilter === 'completed') return matchesSearch && (enrollment.progress || 0) >= 100;
    if (selectedFilter === 'not-started') return matchesSearch && (enrollment.progress || 0) === 0;
    
    return matchesSearch;
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'from-green-500 to-emerald-500';
    if (progress >= 75) return 'from-blue-500 to-purple-500';
    if (progress >= 50) return 'from-yellow-500 to-orange-500';
    if (progress > 0) return 'from-cyan-500 to-blue-500';
    return 'from-gray-500 to-gray-600';
  };

  const getStatusIcon = (progress: number) => {
    if (progress >= 100) return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (progress > 0) return <Play className="w-5 h-5 text-blue-400" />;
    return <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (progress: number) => {
    if (progress >= 100) return 'Completed';
    if (progress > 0) return 'In Progress';
    return 'Not Started';
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

  const formatEnrollmentDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-xl">Loading your courses...</span>
        </div>
      </div>
    );
  }

  if (allCourses.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center text-white relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-[120px] rounded-full animate-pulse-slower"></div>
        
        <div className="text-center max-w-md relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <BookOpen className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Start Your Learning Journey</h2>
          <p className="text-gray-400 mb-8 text-lg">You haven't enrolled in any courses yet. Discover amazing courses and start learning today!</p>
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
            onClick={() => router.push('/categories')}
          >
            <Plus className="w-5 h-5" />
            Browse Courses
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] px-6 py-8 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[150px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15 blur-[120px] rounded-full animate-pulse-slower"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 mb-2">
            My Learning
          </h1>
          <p className="text-gray-400 text-lg">Track your progress and continue your courses</p>
        </div>

        {/* 🆕 NEW: Course Type Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-xl w-fit mx-auto">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'enrolled'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gift className="w-5 h-5" />
              <span>Enrolled Courses</span>
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {enrolledCourses.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('purchased')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'purchased'
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Purchased Courses</span>
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {purchasedCourses.length}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeTab === 'enrolled' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                {activeTab === 'enrolled' ? 
                  <Gift className="w-6 h-6 text-blue-400" /> : 
                  <ShoppingCart className="w-6 h-6 text-purple-400" />
                }
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{currentCourses.length}</h3>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'enrolled' ? 'Enrolled Courses' : 'Purchased Courses'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {currentCourses.filter(c => (c.progress || 0) >= 100).length}
                </h3>
                <p className="text-gray-400 text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Play className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {currentCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length}
                </h3>
                <p className="text-gray-400 text-sm">In Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab} courses...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Filter */}
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all" className="bg-gray-900">All Courses</option>
                <option value="in-progress" className="bg-gray-900">In Progress</option>
                <option value="completed" className="bg-gray-900">Completed</option>
                <option value="not-started" className="bg-gray-900">Not Started</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' ? 'bg-blue-500/30 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'bg-blue-500/30 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Course Grid/List */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              {activeTab === 'enrolled' ? <Gift className="w-8 h-8 text-gray-400" /> : <ShoppingCart className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm ? 'No courses found' : `No ${activeTab} courses yet`}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search or filter criteria' 
                : activeTab === 'enrolled' 
                  ? 'Start learning with free courses from our catalog'
                  : 'Purchase premium courses to access advanced content'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/categories')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Browse Courses
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredCourses.map((enrollment) => {
              const progress = enrollment.progress || 0;
              const isPaid = enrollment.course.price > 0 || enrollment.paymentTransactionId;
              
              return viewMode === 'grid' ? (
                // Grid View
                <div
                  key={enrollment.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(`/courses/${enrollment.course.id}/modules`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(progress)}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        progress >= 100 ? 'bg-green-500/20 text-green-400' :
                        progress > 0 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {getStatusText(progress)}
                      </span>
                      {/* 🆕 NEW: Course type indicator */}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isPaid ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {isPaid ? `$${enrollment.course.price}` : 'Free'}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {enrollment.course.title}
                  </h2>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {enrollment.course.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-semibold text-white">{Math.round(progress)}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{enrollment.course.category?.name}</span>
                      <span>Last: {formatLastAccessed(enrollment.lastAccessed)}</span>
                    </div>

                    {enrollment.completedModules !== undefined && enrollment.totalModules !== undefined && (
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{enrollment.completedModules}/{enrollment.totalModules} modules</span>
                        <span>Enrolled: {formatEnrollmentDate(enrollment.enrolledAt)}</span>
                      </div>
                    )}

                    {/* Course Materials Count */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                      <CourseMaterialsWidget courseId={enrollment.course.id} />
                      <span>Last: {formatLastAccessed(enrollment.lastAccessed)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                // List View - Similar structure with horizontal layout
                <div
                  key={enrollment.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(`/courses/${enrollment.course.id}/modules`)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {getStatusIcon(progress)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                          {enrollment.course.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            progress >= 100 ? 'bg-green-500/20 text-green-400' :
                            progress > 0 ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {getStatusText(progress)}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            isPaid ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {isPaid ? `$${enrollment.course.price}` : 'Free'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3 line-clamp-1">
                        {enrollment.course.description}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-400">{Math.round(progress)}% Complete</span>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>{enrollment.course.category?.name}</span>
                              {enrollment.completedModules !== undefined && enrollment.totalModules !== undefined && (
                                <span>{enrollment.completedModules}/{enrollment.totalModules} modules</span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-500`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                            <span>Last accessed: {formatLastAccessed(enrollment.lastAccessed)}</span>
                            <span>Enrolled: {formatEnrollmentDate(enrollment.enrolledAt)}</span>
                          </div>

                          {/* Course Materials Count */}
                          <div className="mt-1">
                            <CourseMaterialsWidget courseId={enrollment.course.id} />
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse More Courses */}
        <div className="mt-12 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            <h3 className="text-2xl font-bold text-white mb-4">Ready for More?</h3>
            <p className="text-gray-400 mb-6">Explore our course catalog and continue expanding your skills</p>
            <button
              onClick={() => router.push('/categories')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Browse More Courses
            </button>
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
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </main>
  );
}
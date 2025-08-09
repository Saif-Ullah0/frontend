"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpenIcon,
  ClockIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  FolderIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  SparklesIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  duration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  publishStatus: 'DRAFT' | 'PUBLISHED';
  category: {
    id: number;
    name: string;
    description?: string;
    courseCount?: number;
  };
  creator: {
    id: number;
    name: string;
    email: string;
    bio?: string;
    isAdmin: boolean;
  };
  modules: Module[];
  enrollmentCount: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  duration: number;
  orderIndex: number;
  isPublished: boolean;
  chapters: Chapter[];
  isCompleted?: boolean;
  progress?: number;
}

interface Chapter {
  id: number;
  title: string;
  content?: string;
  videoUrl?: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
  duration: number;
  orderIndex: number;
  isPublished: boolean;
  isCompleted?: boolean;
  isFree?: boolean;
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'COURSE';
  finalPrice: number;
  totalPrice: number;
  discount: number;
  savings: number;
  savingsPercentage: number;
  isFeatured: boolean;
  isPopular: boolean;
  totalItems: number;
  courseItems: Array<{
    course: {
      id: number;
      title: string;
      price: number;
      imageUrl?: string;
    };
  }>;
}

interface UserEnrollment {
  id: number;
  progress: number;
  lastAccessed: string;
  enrolledAt: string;
  completed: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [enrollment, setEnrollment] = useState<UserEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'bundles' | 'instructor'>('overview');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchRelatedBundles();
      fetchUserEnrollment();
    }
  }, [courseId]);

 const fetchCourseDetails = async () => {
  try {
    console.log('🎓 STARTING fetchCourseDetails for:', courseId);
    
    const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
      credentials: 'include'
    });

    console.log('📡 Response status:', response.status, 'OK:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API returned data:', data);
      
      setCourse(data.course);
      console.log('✅ Course state updated');
    } else {
      console.error('❌ API error:', response.status);
      const errorData = await response.json();
      toast.error(errorData.message || 'Failed to load course details');
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
    toast.error('Failed to load course details');
  } finally {
    console.log('🏁 Setting loading to false');
    setLoading(false);
  }
};

  const fetchRelatedBundles = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bundles?type=COURSE&search=${courseId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Filter bundles that include this course
        const relatedBundles = data.bundles?.filter((bundle: Bundle) => 
          bundle.courseItems?.some(item => item.course.id === parseInt(courseId))
        ) || [];
        setBundles(relatedBundles);
      }
    } catch (error) {
      console.error('Error fetching related bundles:', error);
    }
  };

  const fetchUserEnrollment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/enrollments/course/${courseId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollment(data.enrollment);
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
    }
  };

  const handleEnrollment = async () => {
    if (!course) return;
    
    setEnrollLoading(true);
    
    try {
      if (course.price === 0) {
        // Free course - direct enrollment
        const response = await fetch(`http://localhost:5000/api/enrollments/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id }),
          credentials: 'include'
        });

        if (response.ok) {
          toast.success('Successfully enrolled in course!');
          fetchUserEnrollment();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to enroll');
        }
      } else {
        // Paid course - redirect to payment
        const response = await fetch(`http://localhost:5000/api/courses/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id }),
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to start purchase');
        }
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Something went wrong');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleBundlePurchase = async (bundleId: number) => {
    try {
      const response = await fetch('http://localhost:5000/api/bundles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to purchase bundle');
      }
    } catch (error) {
      console.error('Error purchasing bundle:', error);
      toast.error('Something went wrong');
    }
  };

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getChapterIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return VideoCameraIcon;
      case 'QUIZ':
        return QuestionMarkCircleIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-500/20 text-green-400';
      case 'INTERMEDIATE':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'ADVANCED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
          <p className="text-gray-400 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            <BookOpenIcon className="w-5 h-5" />
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  const publishedModules = course.modules.filter(m => m.isPublished).sort((a, b) => a.orderIndex - b.orderIndex);
  const totalChapters = publishedModules.reduce((sum, module) => 
    sum + module.chapters.filter(c => c.isPublished).length, 0
  );
  const completedChapters = publishedModules.reduce((sum, module) => 
    sum + module.chapters.filter(c => c.isCompleted).length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <Link href={`/categories/${course.category.id}`} className="hover:text-white transition-colors">
            {course.category.name}
          </Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-white">{course.title}</span>
        </div>

        {/* Course Header */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Image */}
            <div className="lg:col-span-1">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 aspect-video">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <AcademicCapIcon className="w-20 h-20 text-white/50" />
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-xl rounded-xl px-4 py-2">
                  <div className="text-2xl font-bold text-white">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </div>
                </div>
              </div>

              {/* Enrollment Actions */}
              <div className="mt-6 space-y-4">
                {enrollment ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/20 px-4 py-2 rounded-xl">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Enrolled</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">{Math.round(enrollment.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, enrollment.progress)}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${course.id}/learn`}
                      className="block w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 text-center"
                    >
                      Continue Learning
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleEnrollment}
                      disabled={enrollLoading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {enrollLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          {course.price === 0 ? (
                            <>
                              <BookOpenIcon className="w-5 h-5" />
                              Enroll for Free
                            </>
                          ) : (
                            <>
                              <ShoppingCartIcon className="w-5 h-5" />
                              Purchase Course - ${course.price.toFixed(2)}
                            </>
                          )}
                        </>
                      )}
                    </button>

                    {/* Bundle Options */}
                    {bundles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-3">Or save with a bundle:</p>
                        <div className="space-y-2">
                          {bundles.slice(0, 2).map((bundle) => (
                            <div key={bundle.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-white text-sm">{bundle.name}</h4>
                                <div className="flex items-center gap-2">
                                  {bundle.isFeatured && (
                                    <SparklesIcon className="w-4 h-4 text-yellow-400" />
                                  )}
                                  <span className="text-green-400 font-bold">${bundle.finalPrice.toFixed(2)}</span>
                                  <span className="text-gray-400 line-through text-sm">${bundle.totalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{bundle.totalItems} courses</span>
                                <span className="text-xs text-green-400">Save {bundle.savingsPercentage}%</span>
                              </div>
                              <button
                                onClick={() => handleBundlePurchase(bundle.id)}
                                className="w-full mt-2 py-2 bg-green-600/20 border border-green-600/30 hover:bg-green-600/30 text-green-400 rounded-lg font-medium transition-colors text-sm"
                              >
                                Purchase Bundle
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Course Information */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.category.name === 'Web Development' ? 'bg-blue-500/20 text-blue-400' :
                  course.category.name === 'Data Science' ? 'bg-purple-500/20 text-purple-400' :
                  course.category.name === 'Mobile Development' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {course.category.name}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{course.description}</p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FolderIcon className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Modules</p>
                      <p className="text-white font-bold">{publishedModules.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Chapters</p>
                      <p className="text-white font-bold">{totalChapters}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white font-bold">{Math.round(course.duration / 60)}h</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Students</p>
                      <p className="text-white font-bold">{course.enrollmentCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {course.creator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{course.creator.name}</h4>
                    <p className="text-gray-400 text-sm">Course Instructor</p>
                    {course.creator.isAdmin && (
                      <span className="inline-block mt-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                        Verified Instructor
                      </span>
                    )}
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
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'curriculum'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <FolderIcon className="w-4 h-4" />
            Curriculum ({publishedModules.length})
          </button>
          {bundles.length > 0 && (
            <button
              onClick={() => setActiveTab('bundles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === 'bundles'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Bundles ({bundles.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('instructor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'instructor'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <AcademicCapIcon className="w-4 h-4" />
            Instructor
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">What You'll Learn</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">{course.description}</p>
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Learning Objectives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Master the fundamentals of the subject",
                    "Apply concepts through practical exercises",
                    "Build real-world projects",
                    "Develop problem-solving skills"
                  ].map((objective, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                      <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Prerequisites</h3>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-200">
                    {course.level === 'BEGINNER' 
                      ? 'No prior experience required - this course is designed for complete beginners.'
                      : course.level === 'INTERMEDIATE'
                      ? 'Basic understanding of programming concepts recommended.'
                      : 'Advanced knowledge in related technologies is recommended.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {publishedModules.map((module, moduleIndex) => (
                  <div key={module.id} className="border border-white/10 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-6 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 font-semibold">{moduleIndex + 1}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-white">{module.title}</h3>
                          <p className="text-gray-400 text-sm">
                            {module.chapters.filter(c => c.isPublished).length} chapters • {Math.round(module.duration / 60)} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {enrollment && module.isCompleted && (
                          <CheckCircleIcon className="w-6 h-6 text-green-400" />
                        )}
                        {expandedModules.has(module.id) ? (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {expandedModules.has(module.id) && (
                      <div className="border-t border-white/10">
                        {module.chapters
                          .filter(c => c.isPublished)
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((chapter, chapterIndex) => {
                            const ChapterIcon = getChapterIcon(chapter.type);
                            return (
                              <div key={chapter.id} className="p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
                                      <ChapterIcon className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <h4 className="text-white font-medium">{chapter.title}</h4>
                                      <p className="text-gray-400 text-sm">
                                        {chapter.type} • {Math.round(chapter.duration / 60)} min
                                        {chapter.isFree && (
                                          <span className="ml-2 text-green-400">• Free Preview</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {enrollment && chapter.isCompleted ? (
                                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                    ) : enrollment ? (
                                      <PlayCircleIcon className="w-5 h-5 text-blue-400" />
                                    ) : chapter.isFree ? (
                                      <EyeIcon className="w-5 h-5 text-green-400" />
                                    ) : (
                                      <LockClosedIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bundles' && bundles.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Save with Course Bundles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bundles.map((bundle) => (
                  <div key={bundle.id} className="border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white">{bundle.name}</h3>
                          {bundle.isFeatured && (
                            <SparklesIcon className="w-5 h-5 text-yellow-400" />
                          )}
                          {bundle.isPopular && (
                            <div className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                              Popular
                            </div>
                          )}
                        </div>
                        {bundle.description && (
                          <p className="text-gray-400 text-sm mb-3">{bundle.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Bundle Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{bundle.totalItems} courses included</span>
                        <span className="text-green-400 font-medium">Save {bundle.savingsPercentage}%</span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-3xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                          <span className="text-gray-400 line-through ml-3">${bundle.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Bundle Items Preview */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400 font-medium">Included courses:</p>
                        {bundle.courseItems.slice(0, 3).map((item) => (
                          <div key={item.course.id} className="flex items-center gap-2 text-sm">
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">{item.course.title}</span>
                            {item.course.id === course.id && (
                              <span className="text-blue-400">(This Course)</span>
                            )}
                          </div>
                        ))}
                        {bundle.courseItems.length > 3 && (
                          <p className="text-sm text-gray-400">+{bundle.courseItems.length - 3} more courses</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleBundlePurchase(bundle.id)}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300"
                      >
                        Purchase Bundle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instructor' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Meet Your Instructor</h2>
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-2xl">
                      {course.creator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-white">{course.creator.name}</h3>
                      {course.creator.isAdmin && (
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full">
                          Verified Instructor
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {course.creator.bio || 'An experienced educator passionate about sharing knowledge and helping students achieve their learning goals.'}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="w-4 h-4" />
                        <span>Course Creator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{course.enrollmentCount} students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
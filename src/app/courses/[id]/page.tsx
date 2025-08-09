// frontend/src/app/courses/[id]/page.tsx
// Switch to client-side approach since that's already working

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
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [enrollment, setEnrollment] = useState<UserEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'bundles' | 'instructor'>('overview');

  useEffect(() => {
    if (courseId) {
      console.log('🎓 Starting CourseDetailPage for ID:', courseId);
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      console.log('🎓 Fetching course data for ID:', courseId);
      setLoading(true);
      setError(null);

      // Fetch course details with enhanced error handling
      await fetchCourseDetails();
      
      // Fetch related data (don't let these block the main loading)
      fetchRelatedBundles().catch(err => console.warn('❌ Failed to fetch bundles:', err));
      fetchUserEnrollment().catch(err => console.warn('❌ Failed to fetch enrollment:', err));

    } catch (error) {
      console.error('❌ Error in fetchCourseData:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      console.log('🎓 Fetching course details for ID:', courseId);
      
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 Course API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch course`);
      }

      const data = await response.json();
      console.log('✅ Course API response data:', data);

      if (!data.course) {
        throw new Error('No course data received from API');
      }

      // Transform the course data to ensure all expected fields exist
      const transformedCourse: Course = {
        id: data.course.id,
        title: data.course.title || 'Untitled Course',
        description: data.course.description || 'No description available',
        imageUrl: data.course.imageUrl,
        price: data.course.price || 0,
        duration: data.course.duration || 3600,
        level: data.course.level || 'BEGINNER',
        publishStatus: data.course.publishStatus || 'PUBLISHED',
        category: {
          id: data.course.category?.id || 1,
          name: data.course.category?.name || 'General',
          description: data.course.category?.description
        },
        creator: {
          id: data.course.creator?.id || 1,
          name: data.course.creator?.name || 'Course Instructor',
          email: data.course.creator?.email || 'instructor@example.com',
          bio: data.course.creator?.bio,
          isAdmin: data.course.creator?.isAdmin || false
        },
        modules: data.course.modules || [],
        enrollmentCount: data.course.enrollmentCount || 0,
        rating: data.course.rating || 4.5,
        reviewCount: data.course.reviewCount || 0,
        createdAt: data.course.createdAt || new Date().toISOString(),
        updatedAt: data.course.updatedAt || new Date().toISOString()
      };

      console.log('✅ Transformed course data:', transformedCourse);
      setCourse(transformedCourse);

    } catch (error) {
      console.error('❌ Error fetching course details:', error);
      throw error; // Re-throw to be caught by the parent function
    }
  };

  const fetchRelatedBundles = async () => {
    try {
      console.log('📦 Fetching related bundles for course:', courseId);
      
      const response = await fetch(`http://localhost:5000/api/bundles?type=COURSE`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Bundle response:', data);
        
        // Filter bundles that include this course
        const relatedBundles = (data.bundles || []).filter((bundle: Bundle) => 
          bundle.courseItems?.some(item => item.course.id === parseInt(courseId))
        );
        
        console.log('📦 Related bundles found:', relatedBundles.length);
        setBundles(relatedBundles);
      } else {
        console.warn('Failed to fetch bundles:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching related bundles:', error);
      // Don't throw - this is non-critical
    }
  };

  const fetchUserEnrollment = async () => {
    try {
      console.log('👤 Fetching user enrollment for course:', courseId);
      
      const response = await fetch(`http://localhost:5000/api/enrollments/course/${courseId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👤 Enrollment response:', data);
        setEnrollment(data.enrollment);
      } else if (response.status !== 404) {
        console.warn('Failed to fetch enrollment:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching enrollment:', error);
      // Don't throw - this is non-critical
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
          } else {
            // For demo purposes, if no checkout URL, simulate successful enrollment
            toast.success('Course purchased successfully!');
            fetchUserEnrollment();
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to start purchase');
        }
      }
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
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
        } else {
          toast.success('Bundle purchased successfully!');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to purchase bundle');
      }
    } catch (error) {
      console.error('❌ Error purchasing bundle:', error);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className="text-white text-lg">Loading course details...</span>
          <p className="text-gray-400 text-sm mt-2">Course ID: {courseId}</p>
          {/* Add debug info */}
          <div className="mt-4 text-xs text-gray-500">
            Debug: Client-side fetching from http://localhost:5000/api/courses/{courseId}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Failed to Load Course</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => fetchCourseData()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
            >
              <BookOpenIcon className="w-5 h-5" />
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Course not found
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
                    onError={(e) => {
                      console.log('Image failed to load, using fallback');
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
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
                      href={`/courses/${course.id}/modules`}
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

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-6">What You'll Learn</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed">{course.description}</p>
          </div>

          {/* Show modules if available */}
          {publishedModules.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Course Content</h3>
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
                          <h4 className="font-semibold text-white">{module.title}</h4>
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
                                      <h5 className="text-white font-medium">{chapter.title}</h5>
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

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/courses/${courseId}/modules`}
              className="px-6 py-3 bg-blue-600/20 border border-blue-600/30 text-blue-300 rounded-xl hover:bg-blue-600/30 transition-colors"
            >
              View All Modules
            </Link>
            <Link
              href={`/courses/${courseId}/materials`}
              className="px-6 py-3 bg-purple-600/20 border border-purple-600/30 text-purple-300 rounded-xl hover:bg-purple-600/30 transition-colors"
            >
              Course Materials
            </Link>
            {enrollment && (
              <Link
                href={`/courses/${courseId}/modules`}
                className="px-6 py-3 bg-green-600/20 border border-green-600/30 text-green-300 rounded-xl hover:bg-green-600/30 transition-colors"
              >
                Continue Learning
              </Link>
            )}
          </div>
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
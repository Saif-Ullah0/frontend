// /components/CourseDetail.tsx - Updated with Module Shop Link
'use client';
import FastEnrollment from '@/components/FastEnrollment';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Award, 
  CheckCircle2,
  Heart,
  Share2,
  Globe,
  Monitor,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  User,
  Target,
  Zap,
  Shield,
  Infinity,
  Trophy,
  MessageCircle,
  ShoppingCartIcon,
  Lock,
  DollarSign,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

type Module = {
  id: number;
  title: string;
  description?: string;
  duration?: number;
  order: number;
  isPreview?: boolean;
  // NEW: Payment fields
  price?: number;
  isFree?: boolean;
  isPublished?: boolean;
};

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: {
    id: number;
    name: string;
  };
  modules: Module[];
  instructor?: {
    name: string;
    bio?: string;
    avatar?: string;
    rating?: number;
    studentsCount?: number;
  };
  rating?: number;
  studentsCount?: number;
  duration?: string;
  level?: string;
  language?: string;
  lastUpdated?: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
  includes?: string[];
};

type CourseDetailProps = {
  course: Course;
};

// NEW: Module ownership tracking
type ModuleOwnership = {
  [moduleId: number]: boolean;
};

export default function CourseDetail({ course }: CourseDetailProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  // NEW: Module ownership state
  const [moduleOwnership, setModuleOwnership] = useState<ModuleOwnership>({});
  const [loadingModuleOwnership, setLoadingModuleOwnership] = useState(true);

  // Enhanced course data with mock information
  const enhancedCourse = {
    ...course,
    instructor: course.instructor || {
      name: 'Dr. Sarah Johnson',
      bio: 'Senior Software Engineer with 10+ years of experience in web development and education. Passionate about teaching and helping students achieve their goals.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      studentsCount: 12456
    },
    //rating: course.rating || 4.7,
    //studentsCount: course.studentsCount || 8924,
    duration: course.duration || '24 hours',
    level: course.level || 'Intermediate',
    language: course.language || 'English',
    lastUpdated: course.lastUpdated || 'December 2024',
    requirements: course.requirements || [
      'Basic understanding of web development',
      'Familiarity with HTML, CSS, and JavaScript',
      'A computer with internet connection',
      'Desire to learn and practice'
    ],
    whatYouWillLearn: course.whatYouWillLearn || [
      'Master advanced React concepts and patterns',
      'Build scalable applications with TypeScript',
      'Implement state management with Redux Toolkit',
      'Create responsive and accessible user interfaces',
      'Optimize performance and handle testing',
      'Deploy applications to production environments'
    ],
    includes: course.includes || [
      '24 hours of on-demand video',
      '45 downloadable resources',
      'Lifetime access to course materials',
      'Certificate of completion',
      'Direct instructor support',
      'Community access'
    ]
  };

  const totalModules = enhancedCourse.modules.length;
  const previewModules = enhancedCourse.modules.filter(m => m.isPreview).length;
  const totalDuration = enhancedCourse.modules.reduce((acc, module) => acc + (module.duration || 0), 0);
  
  // NEW: Calculate module pricing stats
  const paidModules = enhancedCourse.modules.filter(m => m.price && m.price > 0);
  const freeModules = enhancedCourse.modules.filter(m => !m.price || m.price === 0 || m.isFree);
  const totalModulePrice = paidModules.reduce((sum, m) => sum + (m.price || 0), 0);
  const ownedModules = Object.values(moduleOwnership).filter(Boolean).length;

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/enroll/check/${course.id}`, {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsEnrolled(data.isEnrolled);
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollmentStatus();
  }, [course.id]);

  // NEW: Check module ownership
  useEffect(() => {
    const fetchModuleOwnership = async () => {
      try {
        setLoadingModuleOwnership(true);
        const ownership: ModuleOwnership = {};
        
        // Check ownership for each module
        for (const module of enhancedCourse.modules) {
          try {
            const response = await fetch(`http://localhost:5000/api/payment/modules/${module.id}`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              ownership[module.id] = data.isOwned || false;
            } else {
              ownership[module.id] = false;
            }
          } catch (error) {
            ownership[module.id] = false;
          }
        }
        
        setModuleOwnership(ownership);
      } catch (error) {
        console.error('Failed to fetch module ownership:', error);
      } finally {
        setLoadingModuleOwnership(false);
      }
    };

    fetchModuleOwnership();
  }, [course.id]);

  // Handle enrollment (original logic for Stripe redirect)
  const handleEnroll = async () => {
    setLoading(true);
    
    try {
      if (enhancedCourse.price === 0) {
        // Free course enrollment
        const res = await fetch('http://localhost:5000/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id }),
          credentials: 'include',
        });

        if (res.ok) {
          toast.success('Successfully enrolled! Welcome aboard! 🎉');
          setIsEnrolled(true);
          router.push(`/courses/${course.id}/modules`);
        } else {
          const data = await res.json();
          toast.error(data.error || 'Enrollment failed');
        }
      } else {
        // Paid course - redirect to Stripe hosted checkout
        const res = await fetch('http://localhost:5000/api/payment/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            courseId: course.id
          }),
          credentials: 'include',
        });

        if (res.ok) {
          const { url } = await res.json();
          window.location.href = url; // Redirect to Stripe hosted checkout
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to create payment session');
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful enrollment from FastEnrollment component (for free courses only)
  const handleEnrollmentSuccess = (result: any) => {
    // Update enrollment status
    setIsEnrolled(true);
    
    // Show success message
    toast.success(result.message || 'Enrollment successful! 🎉');
    
    // Redirect to course modules
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    } else {
      router.push(`/courses/${course.id}/modules`);
    }
  };

  // NEW: Handle individual module purchase
  const handleModulePurchase = async (moduleId: number) => {
    try {
      const response = await fetch('http://localhost:5000/api/payment/modules/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else if (data.success) {
          toast.success(data.message);
          // Refresh ownership
          setModuleOwnership(prev => ({ ...prev, [moduleId]: true }));
        }
      } else {
        toast.error(data.error || 'Purchase failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: enhancedCourse.title,
      text: `Check out this amazing course: ${enhancedCourse.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Course link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Course link copied to clipboard!');
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-white truncate">{enhancedCourse.title}</h1>
                <p className="text-gray-400 text-sm">{enhancedCourse.category.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isFavorited 
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
                      : 'bg-white/10 border border-white/20 text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Header */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300 font-medium">
                        {enhancedCourse.level}
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 font-medium">
                        {enhancedCourse.category.name}
                      </span>
                      {/* NEW: Module-wise purchase indicator */}
                      {paidModules.length > 0 && (
                        <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-sm text-orange-300 font-medium flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Individual Modules Available
                        </span>
                      )}
                    </div>
                    
                    <h1 className="text-3xl font-bold text-white mb-4">{enhancedCourse.title}</h1>
                    <p className="text-gray-300 text-lg mb-6">{enhancedCourse.description}</p>
                    
                    {/* <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{enhancedCourse.rating}</span>
                        <span>({enhancedCourse.studentsCount?.toLocaleString()} students)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{enhancedCourse.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{totalModules} modules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{enhancedCourse.language}</span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* NEW: Module Purchase Options (if course has paid modules) */}
              {paidModules.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-400" />
                    Flexible Learning Options
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Course Option */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-blue-400" />
                        Complete Course
                      </h4>
                      <div className="text-2xl font-bold text-white mb-2">
                        {enhancedCourse.price === 0 ? 'Free' : `$${enhancedCourse.price}`}
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        Get access to all {totalModules} modules at once
                      </p>
                      <div className="text-xs text-green-400">
                        {enhancedCourse.price > 0 && totalModulePrice > enhancedCourse.price && (
                          <>💰 Save ${(totalModulePrice - enhancedCourse.price).toFixed(2)} vs individual purchases</>
                        )}
                      </div>
                    </div>

                    {/* Individual Modules Option */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <ShoppingCartIcon className="w-5 h-5 text-orange-400" />
                        Individual Modules
                      </h4>
                      <div className="text-2xl font-bold text-white mb-2">
                        ${paidModules.length > 0 ? Math.min(...paidModules.map(m => m.price || 0)).toFixed(2) : '0'} - ${paidModules.length > 0 ? Math.max(...paidModules.map(m => m.price || 0)).toFixed(2) : '0'}
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        Purchase modules one by one as needed
                      </p>
                      <div className="text-xs text-orange-400">
                        🎯 Perfect for targeted learning
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => router.push(`/courses/${course.id}/modules`)}
                      className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      View All Modules
                    </button>
                    {/* NEW: Module Shop Button */}
                    <button
                      onClick={() => router.push(`/courses/${course.id}/modules-shop`)}
                      className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors text-sm flex items-center gap-2"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      Module Shop
                    </button>
                    <button
                      onClick={() => router.push('/bundles')}
                      className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                    >
                      Create Custom Bundle
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
                <div className="flex border-b border-white/10">
                  {[
                    { key: 'overview', label: 'Overview', icon: Target },
                    { key: 'curriculum', label: 'Curriculum', icon: BookOpen },
                    { key: 'instructor', label: 'Instructor', icon: User },
                    { key: 'reviews', label: 'Reviews', icon: MessageCircle }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex-1 px-6 py-4 text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                        activeTab === key
                          ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      {/* What You'll Learn */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-400" />
                          What You Will Learn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {enhancedCourse.whatYouWillLearn.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-orange-400" />
                          Requirements
                        </h3>
                        <ul className="space-y-2">
                          {enhancedCourse.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-300">
                              <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0 mt-2"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Course Includes */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-400" />
                          This Course Includes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {enhancedCourse.includes.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                              <span className="text-gray-300">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'curriculum' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Course Curriculum</h3>
                        <div className="text-sm text-gray-400">
                          {totalModules} modules • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {enhancedCourse.modules.map((module, index) => {
                          const isOwned = moduleOwnership[module.id] || module.isFree || (module.price || 0) === 0;
                          const isPaid = (module.price || 0) > 0 && !module.isFree;
                          
                          return (
                            <div
                              key={module.id}
                              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                            >
                              <button
                                onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                className="w-full p-4 text-left hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300 font-semibold text-sm">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h4 className="font-semibold text-white">{module.title}</h4>
                                      {/* NEW: Module status indicators */}
                                      {isPaid && !isOwned && (
                                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                                          ${module.price}
                                        </span>
                                      )}
                                      {isOwned && isPaid && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                          Owned
                                        </span>
                                      )}
                                      {module.isFree && (
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                                          Free
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                      <span>{module.duration || 15} minutes</span>
                                      {module.isPreview && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                          Preview
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isPaid && !isOwned && (
                                    <Lock className="w-4 h-4 text-orange-400" />
                                  )}
                                  {expandedModule === module.id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </button>
                              
                              {expandedModule === module.id && (
                                <div className="px-4 pb-4 border-t border-white/10 bg-white/5">
                                  <p className="text-gray-300 text-sm mt-3 mb-4">
                                    {module.description || `Learn about ${module.title.toLowerCase()} with practical examples and hands-on exercises.`}
                                  </p>
                                  
                                  <div className="flex items-center gap-3">
                                    {module.isPreview && (
                                      <button className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition-colors">
                                        <Play className="w-4 h-4 inline mr-2" />
                                        Watch Preview
                                      </button>
                                    )}
                                    
                                    {/* NEW: Individual module purchase */}
                                    {isPaid && !isOwned && !loadingModuleOwnership && (
                                      <button
                                        onClick={() => handleModulePurchase(module.id)}
                                        className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg text-sm hover:bg-orange-500/30 transition-colors flex items-center gap-2"
                                      >
                                        <ShoppingCartIcon className="w-4 h-4" />
                                        Buy Module - ${module.price}
                                      </button>
                                    )}
                                    
                                    {isOwned && (
                                      <button
                                        onClick={() => router.push(`/courses/${course.id}/modules/${module.id}`)}
                                        className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                                      >
                                        <Play className="w-4 h-4" />
                                        Access Module
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'instructor' && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-6">
                        <img
                          src={enhancedCourse.instructor.avatar}
                          alt={enhancedCourse.instructor.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2">{enhancedCourse.instructor.name}</h3>
                          <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{enhancedCourse.instructor.rating} instructor rating</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{enhancedCourse.instructor.studentsCount?.toLocaleString()} students</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>15 courses</span>
                            </div>
                          </div>
                          <p className="text-gray-300">{enhancedCourse.instructor.bio}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">{enhancedCourse.rating}</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(enhancedCourse.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-400">{enhancedCourse.studentsCount?.toLocaleString()} student ratings</p>
                      </div>
                      
                      {/* Mock Reviews */}
                      <div className="space-y-4">
                        {[
                          { name: 'Alex Chen', rating: 5, comment: 'Excellent course! Very comprehensive and well-structured.', date: '2 days ago' },
                          { name: 'Sarah Miller', rating: 5, comment: 'The instructor explains complex concepts very clearly. Highly recommended!', date: '1 week ago' },
                          { name: 'Mike Johnson', rating: 4, comment: 'Great content, though some sections could be more detailed.', date: '2 weeks ago' }
                        ].map((review, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {review.name[0]}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white">{review.name}</h4>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                            <p className="text-gray-300">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Enrollment Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl sticky top-24">
                {enhancedCourse.imageUrl && (
                  <div className="relative mb-6 rounded-xl overflow-hidden">
                    <img
                      src={enhancedCourse.imageUrl}
                      alt={enhancedCourse.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <button className="absolute inset-0 flex items-center justify-center group">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </button>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    {enhancedCourse.price === 0 ? 'Free' : `${enhancedCourse.price}`}
                  </div>
                  {enhancedCourse.price > 0 && (
                    <p className="text-gray-400 text-sm">One-time payment • Lifetime access</p>
                  )}
                  
                  {/* NEW: Module pricing comparison */}
                  {paidModules.length > 0 && totalModulePrice > enhancedCourse.price && (
                    <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-xs font-medium">
                        💰 Save ${(totalModulePrice - enhancedCourse.price).toFixed(2)} vs buying modules individually
                      </p>
                    </div>
                  )}
                </div>

                {checkingEnrollment ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : isEnrolled ? (
                  <div className="space-y-3">
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-300 font-semibold">You are enrolled!</p>
                    </div>
                    <button
                      onClick={() => router.push(`/courses/${course.id}/modules`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Continue Learning
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Use FastEnrollment for free courses, original button for paid courses */}
                    {enhancedCourse.price === 0 ? (
                      <FastEnrollment 
                        course={{
                          id: course.id,
                          title: course.title,
                          price: course.price
                        }}
                        onSuccess={handleEnrollmentSuccess}
                      />
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Trophy className="w-5 h-5" />
                            Enroll Now - ${enhancedCourse.price}
                          </>
                        )}
                      </button>
                    )}

                    {/* NEW: Alternative purchase options */}
                    {paidModules.length > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-400 text-center mb-3">Or purchase modules individually:</p>
                        <div className="space-y-2">
                          {/* NEW: Module Shop Button - Main Call to Action */}
                          <button
                            onClick={() => router.push(`/courses/${course.id}/modules-shop`)}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <ShoppingCartIcon className="w-5 h-5" />
                            🛒 Shop Modules
                          </button>
                          <button
                            onClick={() => router.push(`/courses/${course.id}/modules`)}
                            className="w-full py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Browse All Modules
                          </button>
                          <button
                            onClick={() => router.push('/bundles')}
                            className="w-full py-3 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <Package className="w-4 h-4" />
                            Create Custom Bundle
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 space-y-3 text-center text-sm text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <Infinity className="w-4 h-4" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>Works on desktop & mobile</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </div>

              {/* Course Stats */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-4">Course Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Level</span>
                    <span className="text-white font-semibold">{enhancedCourse.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white font-semibold">{enhancedCourse.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Modules</span>
                    <span className="text-white font-semibold">{totalModules}</span>
                  </div>
                  {/* NEW: Module breakdown */}
                  {paidModules.length > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Free Modules</span>
                        <span className="text-green-400 font-semibold">{freeModules.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Paid Modules</span>
                        <span className="text-orange-400 font-semibold">{paidModules.length}</span>
                      </div>
                      {!loadingModuleOwnership && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Modules Owned</span>
                          <span className="text-blue-400 font-semibold">{ownedModules}/{totalModules}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Language</span>
                    <span className="text-white font-semibold">{enhancedCourse.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white font-semibold">{enhancedCourse.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* NEW: Module Purchase Summary */}
              {paidModules.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Pricing Breakdown
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Complete Course</span>
                      <span className="text-white font-semibold">
                        {enhancedCourse.price === 0 ? 'Free' : `${enhancedCourse.price}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">All Modules Individually</span>
                      <span className="text-orange-400 font-semibold">${totalModulePrice.toFixed(2)}</span>
                    </div>
                    {enhancedCourse.price > 0 && totalModulePrice > enhancedCourse.price && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-green-400">Course Savings</span>
                        <span className="text-green-400 font-semibold">${(totalModulePrice - enhancedCourse.price).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* NEW: Quick Action Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => router.push(`/courses/${course.id}/modules-shop`)}
                      className="w-full py-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors text-sm font-medium"
                    >
                      🛒 Start Shopping Modules
                    </button>
                  </div>
                </div>
              )}
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
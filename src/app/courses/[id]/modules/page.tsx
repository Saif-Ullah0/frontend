'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import CourseNotes from '@/components/student/CourseNotes';
import ModulePurchase from '@/components/ModulePurchase';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  Trophy,
  BarChart3,
  ChevronRight,
  PlayCircle,
  Video,
  FileText,
  X,
  DocumentIcon,
  ShoppingCartIcon,
  StarIcon
} from 'lucide-react';
import { toast } from 'sonner';

type Module = {
  id: number;
  title: string;
  content?: string;
  type: 'TEXT' | 'VIDEO';
  orderIndex: number;
  videoUrl?: string;
  videoDuration?: number;
  videoSize?: string;
  thumbnailUrl?: string;
  description?: string;
  duration?: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  order?: number;
  // NEW: Payment fields
  price?: number;
  isFree?: boolean;
  isPublished?: boolean;
  isOwned?: boolean; // Whether user owns this module
};

type Course = {
  id: number;
  title: string;
  description: string;
  category?: {
    name: string;
  };
  modules?: Module[];
};

type ProgressData = {
  enrollmentId: number;
  courseId: number;
  overallProgress: number;
  lastAccessed: string;
  moduleProgress: any[];
  completedModules: number[];
};

type ModuleOwnership = {
  [moduleId: number]: boolean;
};

export default function CourseModulesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  // NEW: Module ownership tracking
  const [moduleOwnership, setModuleOwnership] = useState<ModuleOwnership>({});
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedModuleForPurchase, setSelectedModuleForPurchase] = useState<Module | null>(null);

  // Load course and progress data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching course and progress data...');
        
        // Fetch course with modules
        const courseRes = await fetch(`http://localhost:5000/api/courses/${id}`, {
          credentials: 'include'
        });

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          console.log('✅ Course data loaded:', courseData.title);
          
          // Process modules
          const processedModules = (courseData.modules || [])
            .sort((a: Module, b: Module) => a.orderIndex - b.orderIndex)
            .map((module: Module, index: number) => ({
              ...module,
              order: index + 1,
              isCompleted: false, // Will be updated from progress data
              isLocked: false,
              isOwned: false // Will be updated from ownership data
            }));

          setModules(processedModules);
          setCourse(courseData);

          // NEW: Fetch module ownership data
          await fetchModuleOwnership(processedModules);

          // Fetch progress data
          console.log('🔄 Fetching progress data...');
          const progressRes = await fetch(`http://localhost:5000/api/progress/course/${id}`, {
            credentials: 'include'
          });

          if (progressRes.ok) {
            const progress = await progressRes.json();
            console.log('✅ Progress data loaded:', progress);
            setProgressData(progress);
            
            // Update modules with completion status
            const updatedModules = processedModules.map((module: Module) => ({
              ...module,
              isCompleted: progress.completedModules.includes(module.id)
            }));
            
            setModules(updatedModules);
            console.log(`📊 Completed modules: ${progress.completedModules.length}`);
          } else {
            console.warn('⚠️ Could not fetch progress data');
            // Still proceed without progress data
          }
          
        } else {
          console.error('❌ Failed to fetch course:', courseRes.status);
          setNotEnrolled(true);
        }
      } catch (err) {
        console.error('❌ Failed to fetch course data:', err);
        setNotEnrolled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // NEW: Fetch module ownership data
  const fetchModuleOwnership = async (modulesToCheck: Module[]) => {
    try {
      const ownership: ModuleOwnership = {};
      
      // Check ownership for each module
      for (const module of modulesToCheck) {
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
          console.warn(`Failed to check ownership for module ${module.id}`);
          ownership[module.id] = false;
        }
      }
      
      setModuleOwnership(ownership);
      
      // Update modules with ownership info
      setModules(prev => prev.map(module => ({
        ...module,
        isOwned: ownership[module.id] || module.isFree || false,
        isLocked: !ownership[module.id] && !module.isFree && module.price > 0
      })));
      
      console.log('✅ Module ownership loaded:', ownership);
    } catch (error) {
      console.error('❌ Failed to fetch module ownership:', error);
    }
  };

  const updateModuleProgress = async (moduleId: number, isCompleted: boolean, watchTime?: number, completionPercentage?: number) => {
    setSavingProgress(true);
    console.log(`💾 Saving progress for module ${moduleId}...`);
    
    try {
      const response = await fetch('http://localhost:5000/api/progress/module', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: parseInt(id as string),
          moduleId,
          isCompleted,
          watchTime: watchTime || 0,
          completionPercentage: completionPercentage || (isCompleted ? 100 : 0)
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Progress saved successfully:', result);
        
        // Update local state
        setModules(prev => prev.map(m => 
          m.id === moduleId ? { ...m, isCompleted } : m
        ));

        // Update progress data
        if (progressData) {
          setProgressData(prev => prev ? {
            ...prev,
            overallProgress: result.overallProgress,
            completedModules: isCompleted 
              ? [...prev.completedModules.filter(id => id !== moduleId), moduleId]
              : prev.completedModules.filter(id => id !== moduleId)
          } : null);
        }

        if (isCompleted) {
          toast.success('Module completed! Progress saved 🎉');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save progress:', response.status, errorText);
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleModuleClick = (module: Module) => {
    // NEW: Check if module is locked due to payment
    if (module.isLocked && !module.isOwned) {
      setSelectedModuleForPurchase(module);
      setShowPurchaseModal(true);
      return;
    }
    
    if (module.isLocked) return;
    
    setCurrentModule(module);
    
    if (module.type === 'VIDEO') {
      setShowVideoPlayer(true);
    } else {
      setShowVideoPlayer(false);
    }
  };

  // NEW: Handle successful module purchase
  const handlePurchaseSuccess = async () => {
    setShowPurchaseModal(false);
    setSelectedModuleForPurchase(null);
    
    // Refresh module ownership
    await fetchModuleOwnership(modules);
    toast.success('Module purchased! You can now access the content.');
  };

  const handleVideoProgress = (videoId: number, currentTime: number, duration: number, progress: number) => {
    // Auto-mark as completed when 90% watched
    if (progress > 90 && !modules.find(m => m.id === videoId)?.isCompleted) {
      console.log(`🎥 Video ${videoId} reached 90%, auto-completing...`);
      updateModuleProgress(videoId, true, currentTime, progress);
    }
  };

  const handleModuleComplete = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (module && !module.isCompleted) {
      console.log(`✅ Manually completing module ${moduleId}...`);
      updateModuleProgress(moduleId, true);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // NEW: Calculate pricing stats
  const completedCount = modules.filter(m => m.isCompleted).length;
  const totalModules = modules.length;
  const progressPercentage = progressData?.overallProgress || 0;
  const ownedModules = modules.filter(m => m.isOwned).length;
  const paidModules = modules.filter(m => m.price > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-xl">Loading course content...</span>
        </div>
      </div>
    );
  }

  if (notEnrolled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white text-center px-4 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-red-500/20 to-pink-500/20 blur-[150px] rounded-full animate-pulse-slow"></div>
        
        <div className="relative z-10 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <Lock className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-red-400">Access Restricted</h2>
          <p className="text-lg text-gray-300 mb-8">You need to be enrolled in this course to access the learning materials.</p>
          <div className="space-y-4">
            <button
              onClick={() => router.push(`/courses/${id}`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 w-full"
            >
              View Course Details
            </button>
            <button
              onClick={() => router.push('/my-courses')}
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-300 w-full"
            >
              Go to My Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15 blur-[120px] rounded-full animate-pulse-slower"></div>

        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/my-courses')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-white truncate">{course?.title}</h1>
                  <p className="text-gray-400 text-sm">{course?.category?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{Math.round(progressPercentage)}% Complete</div>
                    <div className="text-xs text-gray-400">{completedCount} of {totalModules} modules</div>
                  </div>
                  {savingProgress && (
                    <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Course Overview */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">{course?.title}</h2>
                      <p className="text-gray-400">{course?.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Course Progress</span>
                      <span className="font-semibold text-white">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* NEW: Module ownership stats */}
                  {paidModules > 0 && (
                    <div className="mt-4 p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Modules Owned</span>
                        <span className="font-semibold text-white">{ownedModules}/{totalModules}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${(ownedModules / totalModules) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Module List */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <PlayCircle className="w-6 h-6 text-blue-400" />
                      Course Content
                    </h3>
                    <div className="text-sm text-gray-400">
                      {completedCount} / {totalModules} completed
                    </div>
                  </div>

                  {modules.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-300 mb-2">No modules available</h4>
                      <p className="text-gray-400">This course content is being prepared.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {modules.map((module, index) => (
                        <div
                          key={module.id}
                          className={`border rounded-xl p-4 transition-all duration-300 cursor-pointer group ${
                            module.isLocked 
                              ? 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10' 
                              : currentModule?.id === module.id
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                          }`}
                          onClick={() => handleModuleClick(module)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {module.isLocked ? (
                                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-orange-400" />
                                </div>
                              ) : module.isCompleted ? (
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                                </div>
                              ) : module.type === 'VIDEO' ? (
                                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                                  <Video className="w-5 h-5 text-red-400" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                  <FileText className="w-5 h-5 text-blue-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-semibold ${
                                  module.isLocked ? 'text-orange-300' : 'text-white group-hover:text-blue-300'
                                } transition-colors`}>
                                  {module.order || index + 1}. {module.title}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                  {/* NEW: Price indicator */}
                                  {module.price > 0 && !module.isOwned && (
                                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                                      ${module.price}
                                    </span>
                                  )}
                                  {module.isFree && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                      Free
                                    </span>
                                  )}
                                  {module.isOwned && module.price > 0 && (
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                                      Owned
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    module.type === 'VIDEO' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {module.type}
                                  </span>
                                  {module.type === 'VIDEO' && module.videoDuration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatDuration(module.videoDuration)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {module.content && (
                                <p className="text-gray-400 text-sm line-clamp-2">{module.content}</p>
                              )}
                              {/* NEW: Lock indicator */}
                              {module.isLocked && (
                                <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                                  <ShoppingCartIcon className="w-3 h-3" />
                                  Click to purchase and unlock this module
                                </p>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              {module.isLocked ? (
                                <ShoppingCartIcon className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Course Notes & Materials */}
                <CourseNotes courseId={parseInt(id as string)} courseName={course?.title || 'Course'} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Course Stats */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Your Progress
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Modules Completed</span>
                      <span className="font-semibold text-white">{completedCount}/{totalModules}</span>
                    </div>
                    
                    {/* NEW: Module ownership */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Modules Owned</span>
                      <span className="font-semibold text-white">{ownedModules}/{totalModules}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Overall Progress</span>
                      <span className="font-semibold text-white">{Math.round(progressPercentage)}%</span>
                    </div>

                    {progressData?.lastAccessed && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Last Accessed</span>
                        <span className="font-semibold text-white">
                          {new Date(progressData.lastAccessed).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {progressPercentage >= 100 && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
                      <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-green-300 font-semibold text-sm">Congratulations!</p>
                      <p className="text-green-400 text-xs">Course completed</p>
                    </div>
                  )}
                </div>

                {/* NEW: Quick Module Actions */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push('/bundles')}
                      className="w-full p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-all duration-300 text-left"
                    >
                      <span className="text-purple-300">🛍️ Create Module Bundle</span>
                    </button>

                    <button 
                      onClick={() => router.push('/my-modules')}
                      className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all duration-300 text-left"
                    >
                      <span className="text-blue-300">📚 My Purchased Modules</span>
                    </button>
                    
                    <button 
                      onClick={() => router.push('/my-courses')}
                      className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all duration-300 text-left"
                    >
                      <span className="text-green-300">← Back to My Courses</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .line-clamp-2 { 
            display: -webkit-box; 
            -webkit-line-clamp: 2; 
            -webkit-box-orient: vertical; 
            overflow: hidden; 
          }
        `}</style>
      </main>

      {/* NEW: Module Purchase Modal */}
      {showPurchaseModal && selectedModuleForPurchase && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Purchase Module</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <ModulePurchase
              module={{
                id: selectedModuleForPurchase.id,
                title: selectedModuleForPurchase.title,
                content: selectedModuleForPurchase.content,
                price: selectedModuleForPurchase.price || 0,
                duration: selectedModuleForPurchase.duration,
                isFree: selectedModuleForPurchase.isFree || false,
                isPublished: selectedModuleForPurchase.isPublished !== false,
                course: {
                  id: parseInt(id as string),
                  title: course?.title || 'Course'
                }
              }}
              isOwned={false}
              canPurchase={true}
              onPurchaseSuccess={handlePurchaseSuccess}
            />
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && currentModule && currentModule.type === 'VIDEO' && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{currentModule.title}</h2>
                {currentModule.videoDuration && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span>Duration: {formatDuration(currentModule.videoDuration)}</span>
                    {currentModule.isOwned && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        ✓ Owned
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowVideoPlayer(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Video Player */}
            <div className="mb-6">
              <VideoPlayer
                videoId={currentModule.id}
                title={currentModule.title}
                thumbnailUrl={currentModule.thumbnailUrl}
                onProgress={handleVideoProgress}
              />
            </div>

            {/* Module Content */}
            {currentModule.content && (
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {currentModule.content}
                </p>
              </div>
            )}

            {/* Module Actions */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => handleModuleComplete(currentModule.id)}
                disabled={currentModule.isCompleted || savingProgress}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  currentModule.isCompleted
                    ? 'bg-green-600 text-white cursor-default'
                    : savingProgress
                    ? 'bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {savingProgress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : currentModule.isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>

              <div className="text-sm text-gray-400">
                Module {modules.findIndex(m => m.id === currentModule.id) + 1} of {modules.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  Trophy, 
  Star,
  BarChart3,
  Users,
  Download,
  Share2,
  Heart,
  ChevronRight,
  PlayCircle,
  RotateCcw,
  Video,
  FileText,
  X
} from 'lucide-react';

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
};

type Course = {
  id: number;
  title: string;
  description: string;
  category?: {
    name: string;
  };
  instructor?: string;
  rating?: number;
  studentsCount?: number;
  progress?: number;
  modules?: Module[];
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
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course with modules
        const courseRes = await fetch(`http://localhost:5000/api/courses/${id}`, {
          credentials: 'include'
        });

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          
          // Process modules with enhanced data
          const processedModules = (courseData.modules || [])
            .sort((a: Module, b: Module) => a.orderIndex - b.orderIndex)
            .map((module: Module, index: number) => ({
              ...module,
              description: module.content || `Learn about ${module.title.toLowerCase()} with practical examples.`,
              duration: module.type === 'VIDEO' ? Math.round((module.videoDuration || 0) / 60) : Math.floor(Math.random() * 30) + 10,
              isCompleted: false, // Start with no modules completed
              isLocked: false,    // All modules unlocked for enrolled users
              order: index + 1
            }));

          setModules(processedModules);

          // Set course data with enhancements
          setCourse({
            ...courseData,
            instructor: "Dr. Sarah Johnson",
            rating: 4.8,
            studentsCount: 1234,
            progress: 0 // Start with 0% progress
          });

          // For now, skip enrollment checking - assume user is enrolled
          console.log('Course and modules loaded successfully');
          
        } else {
          console.error('Failed to fetch course:', courseRes.status);
          setNotEnrolled(true);
        }
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setNotEnrolled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleModuleClick = (module: Module) => {
    if (module.isLocked) return;
    
    setCurrentModule(module);
    
    if (module.type === 'VIDEO') {
      setShowVideoPlayer(true);
    } else {
      // For text modules, you could navigate to a detailed view
      // For now, just show the module content
      setShowVideoPlayer(false);
    }
  };

  const handleVideoProgress = (videoId: number, currentTime: number, duration: number, progress: number) => {
    // Mark as completed when 90% watched
    if (progress > 90 && !completedModules.includes(videoId)) {
      setCompletedModules(prev => [...prev, videoId]);
      
      // Update the module's completion status
      setModules(prev => prev.map(m => 
        m.id === videoId ? { ...m, isCompleted: true } : m
      ));
    }
  };

  const handleModuleComplete = (moduleId: number) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId]);
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, isCompleted: true } : m
      ));
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: string): string => {
    const num = parseInt(bytes);
    if (!num) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const completedCount = modules.filter(m => m.isCompleted).length;
  const totalModules = modules.length;
  const progressPercentage = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

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
                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-lg mx-auto mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-lg font-semibold text-white">{course?.studentsCount?.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">Students</div>
                    </div>

                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-500/20 rounded-lg mx-auto mb-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="text-lg font-semibold text-white">{course?.rating}</div>
                      <div className="text-xs text-gray-400">Rating</div>
                    </div>

                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-lg mx-auto mb-2">
                        <BookOpen className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-lg font-semibold text-white">{totalModules}</div>
                      <div className="text-xs text-gray-400">Modules</div>
                    </div>

                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-lg mx-auto mb-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {Math.round(modules.reduce((acc, m) => acc + (m.videoDuration || m.duration || 0), 0) / 60)}h
                      </div>
                      <div className="text-xs text-gray-400">Total Time</div>
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
                              ? 'border-gray-600 bg-gray-800/30 cursor-not-allowed' 
                              : currentModule?.id === module.id
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                          }`}
                          onClick={() => handleModuleClick(module)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {module.isLocked ? (
                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-gray-400" />
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
                                  module.isLocked ? 'text-gray-400' : 'text-white group-hover:text-blue-300'
                                } transition-colors`}>
                                  {module.order || index + 1}. {module.title}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
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
                                  {module.type === 'TEXT' && module.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {module.duration}m
                                    </span>
                                  )}
                                </div>
                              </div>
                              {module.description && (
                                <p className="text-gray-400 text-sm line-clamp-2">{module.description}</p>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              {!module.isLocked && (
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Instructor Info */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Instructor</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">SJ</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{course?.instructor}</h4>
                      <p className="text-gray-400 text-sm">Senior Developer</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Experienced software engineer with 10+ years in the industry, specializing in modern web development.
                  </p>
                </div>

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
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Time Spent</span>
                      <span className="font-semibold text-white">
                        {Math.round(completedCount * (modules.reduce((acc, m) => acc + (m.videoDuration || m.duration || 0), 0) / totalModules) / 60 * 10) / 10}h
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Average Score</span>
                      <span className="font-semibold text-white">87%</span>
                    </div>
                  </div>

                  {progressPercentage >= 100 && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
                      <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-green-300 font-semibold text-sm">Congratulations!</p>
                      <p className="text-green-400 text-xs">Course completed</p>
                    </div>
                  )}
                </div>

                {/* Course Actions */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Course Actions</h3>
                  
                  <div className="space-y-3">
                    <button className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-3">
                      <Download className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">Download Resources</span>
                    </button>
                    
                    <button className="w-full p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-all duration-300 flex items-center gap-3">
                      <RotateCcw className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300">Reset Progress</span>
                    </button>
                    
                    <button className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all duration-300 flex items-center gap-3">
                      <Star className="w-4 h-4 text-green-400" />
                      <span className="text-green-300">Rate Course</span>
                    </button>
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
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        `}</style>
      </main>

      {/* Video Player Modal */}
      {showVideoPlayer && currentModule && currentModule.type === 'VIDEO' && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{currentModule.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  {currentModule.videoDuration && (
                    <span>Duration: {formatDuration(currentModule.videoDuration)}</span>
                  )}
                  {currentModule.videoSize && (
                    <span>Size: {formatFileSize(currentModule.videoSize)}</span>
                  )}
                </div>
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
                disabled={completedModules.includes(currentModule.id)}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  completedModules.includes(currentModule.id)
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {completedModules.includes(currentModule.id) ? (
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
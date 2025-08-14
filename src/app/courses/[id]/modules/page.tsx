'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import CourseNotes from '@/components/student/CourseNotes';
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
  X,
  Play,
  FileText,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

type Chapter = {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ';
  order: number;
  duration?: number;
  videoUrl?: string;
  videoDuration?: number;
  videoSize?: bigint;
  thumbnailUrl?: string;
  hasVideo: boolean;
  // Progress tracking
  isCompleted: boolean;
  completionPercentage: number;
  watchTime: number;
  completedAt?: string;
};

type Module = {
  id: number;
  title: string;
  description?: string;
  orderIndex: number;
  type: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  chapters: Chapter[];
  // Progress tracking
  isCompleted: boolean;
  completionPercentage: number;
  completedAt?: string;
};

type Course = {
  id: number;
  title: string;
  description: string;
  category?: {
    name: string;
  };
  modules: Module[];
  enrollmentCount: number;
};

type UserEnrollment = {
  id: number;
  progress: number;
  lastAccessed: string;
  createdAt: string;
};

type ApiResponse = {
  course: Course;
  userEnrollment: UserEnrollment | null;
};

export default function CourseModulesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [courseData, setCourseData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [showContentViewer, setShowContentViewer] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        console.log('🔄 Fetching course data...');
        
        const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data: ApiResponse = await response.json();
          console.log('✅ Course data loaded:', data);
          
          // 🆕 FIXED: Better enrollment detection
          if (!data.userEnrollment) {
            console.log('❌ User not enrolled - userEnrollment is null');
            setNotEnrolled(true);
          } else {
            console.log('✅ User is enrolled:', data.userEnrollment);
            setCourseData(data);
            setNotEnrolled(false); // 🆕 NEW: Explicitly set to false
          }
        } else {
          console.error('❌ Failed to fetch course:', response.status);
          
          // 🆕 IMPROVED: Check if it's auth issue vs not enrolled
          if (response.status === 401) {
            console.log('❌ Not authenticated');
            router.push('/login');
          } else {
            setNotEnrolled(true);
          }
        }
      } catch (err) {
        console.error('❌ Failed to fetch course data:', err);
        setNotEnrolled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, router]);

  // 🆕 NEW: Add debug logging
  console.log('🔍 Component state:', {
    loading,
    notEnrolled,
    hasCourseData: !!courseData,
    userEnrollment: courseData?.userEnrollment
  });


  // Update chapter progress
  const updateChapterProgress = async (chapterId: string, isCompleted: boolean, watchTime?: number, completionPercentage?: number) => {
    setSavingProgress(true);
    console.log(`💾 Updating chapter ${chapterId} progress...`);
    
    try {
      const chapter = findChapterById(chapterId);
      const response = await fetch('http://localhost:5000/api/progress/chapter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: parseInt(id as string),
          chapterId,
          isCompleted,
          watchTime: watchTime || 0,
          completionPercentage: completionPercentage || (isCompleted ? 100 : 0),
          contentType: chapter?.type || 'VIDEO'
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Chapter progress updated:', result);
        
        // Update local state
        setCourseData(prevData => {
          if (!prevData) return null;
          
          return {
            ...prevData,
            course: {
              ...prevData.course,
              modules: prevData.course.modules.map(module => ({
                ...module,
                chapters: module.chapters.map(ch => 
                  ch.id === chapterId ? {
                    ...ch,
                    isCompleted,
                    completionPercentage: completionPercentage || ch.completionPercentage,
                    watchTime: watchTime || ch.watchTime,
                    completedAt: isCompleted ? new Date().toISOString() : ch.completedAt
                  } : ch
                )
              }))
            },
            userEnrollment: prevData.userEnrollment ? {
              ...prevData.userEnrollment,
              progress: result.overallProgress || prevData.userEnrollment.progress
            } : null
          };
        });

        // Show completion message
        if (isCompleted && !chapter?.isCompleted) {
          toast.success(`🎉 ${chapter?.type === 'VIDEO' ? 'Video' : 'Chapter'} completed!`);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to update progress:', response.status, errorText);
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setSavingProgress(false);
    }
  };

  // Find chapter by ID
  const findChapterById = (chapterId: string): Chapter | null => {
    if (!courseData) return null;
    
    for (const module of courseData.course.modules) {
      const chapter = module.chapters.find(ch => ch.id === chapterId);
      if (chapter) return chapter;
    }
    return null;
  };

  // Handle chapter click
  const handleChapterClick = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    
    if (chapter.type === 'VIDEO' && chapter.hasVideo) {
      setShowContentViewer(true);
    } else if (chapter.type === 'TEXT') {
      // Mark text chapter as started and show content
      updateChapterProgress(chapter.id, false, 1, 1);
      setShowContentViewer(true);
    } else if (chapter.type === 'QUIZ') {
      // Navigate to quiz interface or show quiz content
      setShowContentViewer(true);
    } else {
      // Default content viewer
      setShowContentViewer(true);
    }
  };

  // Handle video progress
  const handleVideoProgress = (videoId: number, currentTime: number, duration: number, progress: number) => {
      console.log(`📊 Video progress: ${Math.round(progress)}%`);

    const chapterId = currentChapter?.id;
    if (!chapterId) return;

    // Auto-complete when 90% watched
    if (progress >= 90) {
      const chapter = findChapterById(chapterId);
      if (chapter && !chapter.isCompleted) {
        console.log(`🎥 Video ${chapterId} reached ${Math.round(progress)}%, auto-completing...`);
        updateChapterProgress(chapterId, true, currentTime, progress);
      }
    } else {
      // Save progress every 10% increment
      const roundedProgress = Math.floor(progress / 10) * 10;
      const chapter = findChapterById(chapterId);
      if (chapter && roundedProgress > chapter.completionPercentage) {
        updateChapterProgress(chapterId, false, currentTime, progress);
      }
    }
  };

  // Handle text/PDF completion
  const handleTextCompletion = (chapterId: string) => {
    updateChapterProgress(chapterId, true, 30, 100);
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get chapter icon
  const getChapterIcon = (chapter: Chapter) => {
    switch (chapter.type) {
      case 'VIDEO':
        return <Video className="h-5 w-5" />;
      case 'TEXT':
        return <FileText className="h-5 w-5" />;
      case 'QUIZ':
        return <HelpCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Get chapter status
  const getChapterStatus = (chapter: Chapter) => {
    if (chapter.isCompleted) return { label: 'COMPLETED', color: 'green', icon: CheckCircle2 };
    if (chapter.completionPercentage > 0) {
      return { 
        label: `${Math.round(chapter.completionPercentage)}% COMPLETE`, 
        color: 'blue', 
        icon: Play 
      };
    }
    return { label: 'NOT STARTED', color: 'gray', icon: PlayCircle };
  };

  // Calculate stats
  const totalChapters = courseData?.course.modules.reduce((sum, module) => sum + module.chapters.length, 0) || 0;
  const completedChapters = courseData?.course.modules.reduce((sum, module) => 
    sum + module.chapters.filter(ch => ch.isCompleted).length, 0) || 0;
  const progressPercentage = courseData?.userEnrollment?.progress || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-xl">Loading course content...</span>
        </div>
      </div>
    );
  }

  if (notEnrolled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white text-center px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
          <Lock className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-red-400">Access Restricted</h2>
        <p className="text-lg text-gray-300 mb-8">You need to be enrolled in this course to access the content.</p>
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
    );
  }

  const course = courseData?.course;
  if (!course) return null;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[150px] rounded-full animate-pulse-slow"></div>

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
                  <h1 className="text-xl font-semibold text-white truncate">{course.title}</h1>
                  <p className="text-gray-400 text-sm">{course.category?.name} • {totalChapters} chapters</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{Math.round(progressPercentage)}% Complete</div>
                    <div className="text-xs text-gray-400">{completedChapters} of {totalChapters} chapters</div>
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
                  <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
                  <p className="text-gray-400 mb-6">{course.description}</p>

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

                {/* Course Modules */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-400" />
                      Course Content
                    </h3>
                    <div className="text-sm text-gray-400">
                      {completedChapters} / {totalChapters} chapters completed
                    </div>
                  </div>

                  {course.modules.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-300 mb-2">No content available</h4>
                      <p className="text-gray-400">Course content is being prepared.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {course.modules.map((module, moduleIndex) => (
                        <div key={module.id} className="border border-white/10 rounded-xl overflow-hidden">
                          {/* Module Header */}
                          <div className="bg-white/5 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-blue-400 font-semibold">{moduleIndex + 1}</span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white">{module.title}</h4>
                                  <p className="text-gray-400 text-sm">
                                    {module.chapters.length} chapters
                                    {module.isCompleted && (
                                      <span className="ml-2 text-green-400">• Completed</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              {module.isCompleted && (
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                              )}
                            </div>
                            
                            {/* Module Progress Bar */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                  style={{ width: `${module.completionPercentage || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Chapters */}
                          <div className="divide-y divide-white/10">
                            {module.chapters.map((chapter, chapterIndex) => {
                              const status = getChapterStatus(chapter);
                              const StatusIcon = status.icon;
                              
                              return (
                                <div
                                  key={chapter.id}
                                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                                  onClick={() => handleChapterClick(chapter)}
                                >
                                  <div className="flex items-center gap-4">
                                    {/* Chapter Icon & Status */}
                                    <div className="flex-shrink-0">
                                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                        status.color === 'green' ? 'bg-green-500/20' :
                                        status.color === 'blue' ? 'bg-blue-500/20' : 'bg-gray-500/20'
                                      }`}>
                                        {chapter.isCompleted ? (
                                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                                        ) : (
                                          getChapterIcon(chapter)
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                                          {chapterIndex + 1}. {chapter.title}
                                        </h5>
                                        <div className="flex items-center gap-3 text-sm">
                                          {/* Status Badge */}
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            status.color === 'green' ? 'bg-green-500/20 text-green-400' :
                                            status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-gray-500/20 text-gray-400'
                                          }`}>
                                            {status.label}
                                          </span>
                                          
                                          {/* Duration */}
                                          {(chapter.videoDuration || chapter.duration) && (
                                            <span className="flex items-center gap-1 text-gray-400">
                                              <Clock className="w-4 h-4" />
                                              {formatDuration(chapter.videoDuration || chapter.duration || 0)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Progress Bar for Partially Completed */}
                                      {chapter.completionPercentage > 0 && !chapter.isCompleted && (
                                        <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                                          <div 
                                            className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                            style={{ width: `${chapter.completionPercentage}%` }}
                                          ></div>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm capitalize">
                                          {chapter.type.toLowerCase()} Chapter
                                          {chapter.hasVideo && ' • Video Available'}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Course Notes & Materials */}
                <CourseNotes courseId={parseInt(id as string)} courseName={course.title} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Course Stats */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Progress Overview
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Chapters Completed</span>
                      <span className="font-semibold text-white">{completedChapters}/{totalChapters}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Overall Progress</span>
                      <span className="font-semibold text-white">{Math.round(progressPercentage)}%</span>
                    </div>

                    {courseData.userEnrollment?.lastAccessed && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Last Accessed</span>
                        <span className="font-semibold text-white">
                          {new Date(courseData.userEnrollment.lastAccessed).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {progressPercentage >= 100 && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
                      <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-green-300 font-semibold text-sm">Course Completed!</p>
                      <p className="text-green-400 text-xs">All chapters finished</p>
                    </div>
                  )}
                </div>

                {/* Learning Tips */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">💡 Learning Tips</h3>
                  
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Videos auto-complete at 90% watched</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Text chapters complete after 30 seconds</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Progress saves automatically</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
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
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        `}</style>
      </main>

      {/* Content Viewer Modal */}
      {showContentViewer && currentChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{currentChapter.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="capitalize">{currentChapter.type} Chapter</span>
                  {(currentChapter.videoDuration || currentChapter.duration) && (
                    <span>Duration: {formatDuration(currentChapter.videoDuration || currentChapter.duration || 0)}</span>
                  )}
                  {currentChapter.completionPercentage > 0 && !currentChapter.isCompleted && (
                    <span>Progress: {Math.round(currentChapter.completionPercentage)}%</span>
                  )}
                  {currentChapter.isCompleted && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowContentViewer(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              {currentChapter.type === 'VIDEO' && currentChapter.videoUrl ? (
                <VideoPlayer
                  videoId={parseInt(currentChapter.id)} // Convert string ID to number for compatibility
                  chapterId={currentChapter.id}
                  courseId={parseInt(id as string)} // Pass the course ID
                  title={currentChapter.title}
                  videoUrl={currentChapter.videoUrl} // 🆕 NEW: Pass the full video URL
                  thumbnailUrl={currentChapter.thumbnailUrl}
                  onProgress={handleVideoProgress}
                />
              ) : currentChapter.type === 'TEXT' ? (
                <div className="bg-white/5 rounded-xl p-6">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: currentChapter.content || '<p>Text content will be displayed here.</p>' 
                    }}
                  />
                  {!currentChapter.isCompleted && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <button
                        onClick={() => handleTextCompletion(currentChapter.id)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        Mark as Complete
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-8 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Content Not Available</h3>
                  <p className="text-gray-400">This chapter's content is being prepared.</p>
                </div>
              )}
            </div>

            {/* Auto-completion info */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {currentChapter.isCompleted ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Chapter completed
                  </span>
                ) : currentChapter.type === 'VIDEO' ? (
                  <span>Video will auto-complete at 90% watched</span>
                ) : (
                  <span>Mark as complete when finished reading</span>
                )}
                {savingProgress && (
                  <span className="flex items-center gap-2 ml-4">
                    <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                    Saving progress...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
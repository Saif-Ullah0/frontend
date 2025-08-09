// app/courses/[id]/learn/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Menu, 
  X, 
  BookOpen, 
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Video,
  FileText,
  HelpCircle,
  Settings,
  Maximize,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useCourseData } from '@/hooks/useCourseData';
import { useProgress } from '@/hooks/useProgress';

interface Course {
  id: number;
  title: string;
  description: string;
  modules: Module[];
}

interface Module {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  chapters: Chapter[];
  isFree: boolean;
  price: number;
  isPublished: boolean;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number;
  order: number;
  type: 'VIDEO' | 'TEXT' | 'PDF' | 'QUIZ';
  moduleId: number;
}

interface ChapterProgress {
  chapterId: string;
  isCompleted: boolean;
  watchTime: number;
  completionPercentage: number;
}

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  
  // State management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  // Custom hooks
  const { course, loading, error } = useCourseData(courseId);
  const { 
    progress, 
    updateChapterProgress, 
    calculateCourseProgress
  } = useProgress(courseId);

  // Get current chapter from URL params or default to first
  useEffect(() => {
    const chapterParam = searchParams.get('chapter');
    const moduleParam = searchParams.get('module');
    
    if (chapterParam) {
      setCurrentChapterId(chapterParam);
    }
    
    if (moduleParam) {
      setCurrentModuleId(parseInt(moduleParam));
    }
    
    // Auto-select first chapter if none selected
    if (course?.modules?.[0]?.chapters?.[0] && !chapterParam) {
      const firstChapter = course.modules[0].chapters[0];
      setCurrentChapterId(firstChapter.id);
      setCurrentModuleId(course.modules[0].id);
      setExpandedModules(new Set([course.modules[0].id]));
    }
  }, [course, searchParams]);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigate to chapter
  const navigateToChapter = (chapterId: string, moduleId: number) => {
    setCurrentChapterId(chapterId);
    setCurrentModuleId(moduleId);
    
    // Expand the module
    setExpandedModules(prev => new Set([...prev, moduleId]));
    
    // Update URL
    router.push(`/courses/${courseId}/learn?chapter=${chapterId}&module=${moduleId}`, { scroll: false });
    
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Get current chapter data
  const getCurrentChapter = (): Chapter | null => {
    if (!course || !currentChapterId) return null;
    
    for (const module of course.modules) {
      const chapter = module.chapters.find(ch => ch.id === currentChapterId);
      if (chapter) return chapter;
    }
    return null;
  };

  // Get current module
  const getCurrentModule = (): Module | null => {
    if (!course || !currentModuleId) return null;
    return course.modules.find(m => m.id === currentModuleId) || null;
  };

  // Navigation helpers
  const getAdjacentChapter = (direction: 'next' | 'prev'): { chapter: Chapter; module: Module } | null => {
    if (!course || !currentChapterId) return null;

    const allChapters: Array<{ chapter: Chapter; module: Module }> = [];
    course.modules
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .forEach(module => {
        module.chapters
          .sort((a, b) => a.order - b.order)
          .forEach(chapter => allChapters.push({ chapter, module }));
      });

    const currentIndex = allChapters.findIndex(item => item.chapter.id === currentChapterId);
    if (currentIndex === -1) return null;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    return allChapters[nextIndex] || null;
  };

  const navigateToAdjacentChapter = (direction: 'next' | 'prev') => {
    const adjacent = getAdjacentChapter(direction);
    if (adjacent) {
      navigateToChapter(adjacent.chapter.id, adjacent.module.id);
    }
  };

  // Handle progress updates
  const handleProgressUpdate = async (chapterId: string, progressData: Partial<ChapterProgress>) => {
    try {
      await updateChapterProgress(chapterId, progressData);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // Auto-advance to next chapter when current is completed
  const handleChapterComplete = () => {
    const next = getAdjacentChapter('next');
    if (next) {
      setTimeout(() => {
        navigateToChapter(next.chapter.id, next.module.id);
      }, 1500);
    }
  };

  // Toggle module expansion
  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Get chapter icon
  const getChapterIcon = (chapter: Chapter) => {
    switch (chapter.type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'QUIZ':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get chapter progress
  const getChapterProgress = (chapterId: string): ChapterProgress | undefined => {
    return progress.find(p => p.chapterId === chapterId);
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className="text-white text-lg">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
          <p className="text-gray-400 mb-4">The course you're looking for doesn't exist or you don't have access.</p>
          <Link 
            href="/courses"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors inline-block"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const currentChapter = getCurrentChapter();
  const currentModule = getCurrentModule();
  const courseProgress = calculateCourseProgress();
  const nextChapterData = getAdjacentChapter('next');
  const prevChapterData = getAdjacentChapter('prev');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <Link
                href={`/courses/${courseId}`}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>

              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white truncate max-w-md">
                  {course.title}
                </h1>
                {currentModule && (
                  <p className="text-sm text-gray-400">{currentModule.title}</p>
                )}
              </div>
            </div>

            {/* Center - Progress */}
            <div className="flex-1 max-w-md mx-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {Math.round(courseProgress)}%
                </span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  Complete
                </span>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2">
              {/* Navigation buttons */}
              <button
                onClick={() => navigateToAdjacentChapter('prev')}
                disabled={!prevChapterData}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Chapter"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateToAdjacentChapter('next')}
                disabled={!nextChapterData}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Chapter"
              >
                <SkipForward className="h-5 w-5" />
              </button>
              
              {/* Exit button */}
              <Link
                href={`/courses/${courseId}`}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Exit
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`
          ${isMobile ? 'fixed inset-y-16 left-0 z-40' : 'relative'}
          ${isSidebarOpen ? 'w-80' : 'w-0'}
          bg-white/5 border-r border-white/10 backdrop-blur-xl
          transform transition-all duration-300 ease-in-out overflow-hidden
        `}>
          <div className="h-full flex flex-col">
            {/* Sidebar header */}
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white mb-2">Course Content</h2>
              <div className="text-sm text-gray-400">
                {course.modules.length} modules • {course.modules.reduce((sum, m) => sum + m.chapters.length, 0)} chapters
              </div>
            </div>

            {/* Modules and chapters list */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {course.modules
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((module, moduleIndex) => {
                    const isExpanded = expandedModules.has(module.id);
                    const moduleChapters = module.chapters.sort((a, b) => a.order - b.order);
                    const completedChapters = moduleChapters.filter(ch => 
                      getChapterProgress(ch.id)?.isCompleted
                    ).length;
                    const moduleProgress = moduleChapters.length > 0 
                      ? (completedChapters / moduleChapters.length) * 100 
                      : 0;
                    
                    return (
                      <div key={module.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        {/* Module header */}
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-400 font-semibold text-sm">{moduleIndex + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white truncate mb-1">
                                {module.title}
                              </h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${moduleProgress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">
                                  {Math.round(moduleProgress)}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                {moduleChapters.length} chapters
                                {!module.isFree && (
                                  <span className="ml-2 text-yellow-400">• Premium</span>
                                )}
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>

                        {/* Chapters list */}
                        {isExpanded && (
                          <div className="border-t border-white/10">
                            {moduleChapters.map((chapter, chapterIndex) => {
                              const chapterProgress = getChapterProgress(chapter.id);
                              const isCompleted = chapterProgress?.isCompleted || false;
                              const isCurrent = currentChapterId === chapter.id;
                              
                              return (
                                <button
                                  key={chapter.id}
                                  onClick={() => navigateToChapter(chapter.id, module.id)}
                                  className={`
                                    w-full flex items-center space-x-3 p-4 text-left transition-all border-b border-white/5 last:border-b-0
                                    ${isCurrent 
                                      ? 'bg-blue-500/20 border-l-4 border-l-blue-500 text-blue-300' 
                                      : 'hover:bg-white/5 text-gray-300'
                                    }
                                  `}
                                >
                                  {/* Status icon */}
                                  <div className="flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle className="h-5 w-5 text-green-400" />
                                    ) : isCurrent ? (
                                      <Play className="h-5 w-5 text-blue-400" />
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-gray-500" />
                                    )}
                                  </div>

                                  {/* Chapter info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      {getChapterIcon(chapter)}
                                      <span className={`font-medium truncate text-sm ${
                                        isCurrent ? 'text-blue-300' : 'text-white'
                                      }`}>
                                        {chapterIndex + 1}. {chapter.title}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                      {chapter.duration && (
                                        <span className="flex items-center space-x-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{formatDuration(chapter.duration)}</span>
                                        </span>
                                      )}
                                      <span>•</span>
                                      <span className="capitalize">{chapter.type.toLowerCase()}</span>
                                      {chapterProgress && chapterProgress.completionPercentage > 0 && !isCompleted && (
                                        <>
                                          <span>•</span>
                                          <span>{Math.round(chapterProgress.completionPercentage)}% watched</span>
                                        </>
                                      )}
                                    </div>

                                    {/* Progress bar for in-progress chapters */}
                                    {chapterProgress && chapterProgress.completionPercentage > 0 && !isCompleted && (
                                      <div className="mt-2">
                                        <div className="w-full bg-gray-700 rounded-full h-1">
                                          <div 
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${chapterProgress.completionPercentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentChapter ? (
            <div className="flex-1 flex flex-col">
              {/* Chapter header */}
              <div className="bg-white/5 border-b border-white/10 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getChapterIcon(currentChapter)}
                        <h1 className="text-2xl font-bold text-white">{currentChapter.title}</h1>
                        {getChapterProgress(currentChapter.id)?.isCompleted && (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        )}
                      </div>
                      {currentChapter.description && (
                        <p className="text-gray-400 mb-4">{currentChapter.description}</p>
                      )}
                      
                      {/* Chapter info */}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {currentChapter.duration && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(currentChapter.duration)}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span className="capitalize">{currentChapter.type.toLowerCase()}</span>
                        {getChapterProgress(currentChapter.id) && (
                          <>
                            <span>•</span>
                            <span>{Math.round(getChapterProgress(currentChapter.id)?.completionPercentage || 0)}% complete</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter content */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6">
                  {currentChapter.type === 'VIDEO' && currentChapter.videoUrl ? (
                    /* Video content */
                    <div className="bg-black rounded-xl overflow-hidden mb-6">
                      <video
                        className="w-full h-auto"
                        src={currentChapter.videoUrl}
                        controls
                        poster="/api/placeholder/800/450"
                        onTimeUpdate={(e) => {
                          const video = e.target as HTMLVideoElement;
                          const percentage = (video.currentTime / video.duration) * 100;
                          if (percentage >= 90) {
                            handleProgressUpdate(currentChapter.id, {
                              completionPercentage: 100,
                              isCompleted: true,
                              watchTime: video.currentTime
                            });
                          } else {
                            handleProgressUpdate(currentChapter.id, {
                              completionPercentage: percentage,
                              watchTime: video.currentTime
                            });
                          }
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    /* Text content */
                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-6 backdrop-blur-xl">
                      <div 
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentChapter.content || 'No content available.' }}
                      />
                    </div>
                  )}

                  {/* Chapter navigation */}
                  <div className="flex justify-between items-center">
                    <div>
                      {prevChapterData && (
                        <button
                          onClick={() => navigateToChapter(prevChapterData.chapter.id, prevChapterData.module.id)}
                          className="flex items-center space-x-2 px-6 py-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                        >
                          <SkipBack className="h-4 w-4" />
                          <div className="text-left">
                            <div className="text-xs text-gray-400">Previous</div>
                            <div className="font-medium">{prevChapterData.chapter.title}</div>
                          </div>
                        </button>
                      )}
                    </div>
                    
                    <div>
                      {nextChapterData && (
                        <button
                          onClick={() => navigateToChapter(nextChapterData.chapter.id, nextChapterData.module.id)}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300"
                        >
                          <div className="text-right">
                            <div className="text-xs text-blue-200">Next</div>
                            <div className="font-medium">{nextChapterData.chapter.title}</div>
                          </div>
                          <SkipForward className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Select a Chapter</h2>
                <p className="text-gray-400">Choose a chapter from the sidebar to start learning.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
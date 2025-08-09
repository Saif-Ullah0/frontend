// components/learning/CourseNavigationSidebar.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Play, CheckCircle, Clock, Lock, FileText, Video, FileQuestion } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

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

interface CourseNavigationSidebarProps {
  course: Course;
  currentChapterId: string | null;
  progress: ChapterProgress[];
  isOpen: boolean;
  isMobile: boolean;
  onChapterSelect: (chapterId: string) => void;
  onClose: () => void;
}

export default function CourseNavigationSidebar({
  course,
  currentChapterId,
  progress,
  isOpen,
  isMobile,
  onChapterSelect,
  onClose
}: CourseNavigationSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(course.modules.map(m => m.id))
  );

  // Helper functions
  const getChapterProgress = (chapterId: string): ChapterProgress | undefined => {
    return progress.find(p => p.chapterId === chapterId);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateModuleProgress = (module: Module): number => {
    if (module.chapters.length === 0) return 0;
    
    const totalProgress = module.chapters.reduce((sum, chapter) => {
      const chapterProgress = getChapterProgress(chapter.id);
      return sum + (chapterProgress?.completionPercentage || 0);
    }, 0);
    
    return totalProgress / module.chapters.length;
  };

  const getChapterIcon = (chapter: Chapter) => {
    switch (chapter.type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'QUIZ':
        return <FileQuestion className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  const isChapterAccessible = (chapter: Chapter, module: Module): boolean => {
    // Free modules are always accessible
    if (module.isFree) return true;
    
    // Check if user has access to paid module (implement your logic here)
    // For now, assume all are accessible
    return true;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'fixed left-0 top-16 bottom-0'}
        w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Course Content</h2>
          <div className="text-sm text-gray-600">
            {course.modules.length} modules • {course.modules.reduce((sum, m) => sum + m.chapters.length, 0)} chapters
          </div>
        </div>

        {/* Modules and chapters list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {course.modules
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((module) => {
                const moduleProgress = calculateModuleProgress(module);
                const isExpanded = expandedModules.has(module.id);
                
                return (
                  <div key={module.id} className="mb-2">
                    {/* Module header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {module.title}
                            </h3>
                            {!module.isFree && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Lock className="h-3 w-3 mr-1" />
                                ${module.price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <ProgressBar 
                              progress={moduleProgress} 
                              className="flex-1 h-1.5" 
                            />
                            <span className="text-xs text-gray-500">
                              {Math.round(moduleProgress)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Chapters list */}
                    {isExpanded && (
                      <div className="mt-2 ml-4 space-y-1">
                        {module.chapters
                          .sort((a, b) => a.order - b.order)
                          .map((chapter) => {
                            const chapterProgress = getChapterProgress(chapter.id);
                            const isCompleted = chapterProgress?.isCompleted || false;
                            const isCurrent = currentChapterId === chapter.id;
                            const isAccessible = isChapterAccessible(chapter, module);
                            
                            return (
                              <button
                                key={chapter.id}
                                onClick={() => isAccessible && onChapterSelect(chapter.id)}
                                disabled={!isAccessible}
                                className={`
                                  w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all
                                  ${isCurrent 
                                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-900' 
                                    : isAccessible
                                      ? 'hover:bg-gray-50 text-gray-700'
                                      : 'text-gray-400 cursor-not-allowed'
                                  }
                                `}
                              >
                                {/* Status icon */}
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : isCurrent ? (
                                    <Play className="h-5 w-5 text-blue-500" />
                                  ) : !isAccessible ? (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                  )}
                                </div>

                                {/* Chapter info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    {getChapterIcon(chapter)}
                                    <span className={`font-medium truncate ${
                                      isCurrent ? 'text-blue-900' : 'text-gray-900'
                                    }`}>
                                      {chapter.title}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    {chapter.duration && (
                                      <span className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatDuration(chapter.duration)}</span>
                                      </span>
                                    )}
                                    {chapterProgress && chapterProgress.completionPercentage > 0 && !isCompleted && (
                                      <span>• {Math.round(chapterProgress.completionPercentage)}% watched</span>
                                    )}
                                  </div>

                                  {/* Progress bar for in-progress chapters */}
                                  {chapterProgress && chapterProgress.completionPercentage > 0 && !isCompleted && (
                                    <div className="mt-2">
                                      <ProgressBar 
                                        progress={chapterProgress.completionPercentage} 
                                        className="h-1" 
                                      />
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

        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Overall Progress
            </p>
            <ProgressBar 
              progress={
                course.modules.reduce((sum, module) => sum + calculateModuleProgress(module), 0) / 
                course.modules.length
              } 
              className="mb-2"
            />
            <p className="text-xs text-gray-500">
              {Math.round(
                course.modules.reduce((sum, module) => sum + calculateModuleProgress(module), 0) / 
                course.modules.length
              )}% Complete
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
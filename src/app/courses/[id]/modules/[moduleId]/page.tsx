// app/courses/[id]/modules/[moduleId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, CheckCircle, Clock, Lock, Video, FileText, FileQuestion, ChevronRight } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import { useCourseData } from '@/hooks/useCourseData';
import { useProgress } from '@/hooks/useProgress';

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

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = parseInt(params.moduleId as string);

  const { course, loading, error } = useCourseData(courseId);
  const { progress } = useProgress(courseId);

  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Get current module
  const currentModule = course?.modules.find(m => m.id === moduleId);

  // Get chapter progress
  const getChapterProgress = (chapterId: string): ChapterProgress | undefined => {
    return progress.find(p => p.chapterId === chapterId);
  };

  // Calculate module progress
  const calculateModuleProgress = (): number => {
    if (!currentModule || currentModule.chapters.length === 0) return 0;
    
    const totalProgress = currentModule.chapters.reduce((sum, chapter) => {
      const chapterProgress = getChapterProgress(chapter.id);
      return sum + (chapterProgress?.completionPercentage || 0);
    }, 0);
    
    return totalProgress / currentModule.chapters.length;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get chapter icon
  const getChapterIcon = (chapter: Chapter) => {
    switch (chapter.type) {
      case 'VIDEO':
        return <Video className="h-5 w-5" />;
      case 'TEXT':
        return <FileText className="h-5 w-5" />;
      case 'QUIZ':
        return <FileQuestion className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Navigate to learning interface
  const startLearning = (chapterId?: string) => {
    const firstChapter = chapterId || currentModule?.chapters[0]?.id;
    if (firstChapter) {
      router.push(`/courses/${courseId}/learn?chapter=${firstChapter}`);
    }
  };

  // Check if chapter is accessible
  const isChapterAccessible = (chapter: Chapter): boolean => {
    // If module is free, all chapters are accessible
    if (currentModule?.isFree) return true;
    
    // Add your logic for paid content access
    return true; // Placeholder
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error || !course || !currentModule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Module Not Found</h1>
          <p className="text-gray-600 mb-4">The module you're looking for doesn't exist or you don't have access.</p>
          <button 
            onClick={() => router.push(`/courses/${courseId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const moduleProgress = calculateModuleProgress();
  const completedChapters = currentModule.chapters.filter(chapter => 
    getChapterProgress(chapter.id)?.isCompleted
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{currentModule.title}</h1>
                <p className="text-sm text-gray-500">{course.title}</p>
              </div>
            </div>
            
            <button
              onClick={() => startLearning()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Continue Learning</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module info sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{currentModule.title}</h2>
              
              {currentModule.description && (
                <p className="text-gray-600 mb-6">{currentModule.description}</p>
              )}

              {/* Progress overview */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(moduleProgress)}%</span>
                  </div>
                  <ProgressBar progress={moduleProgress} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900">{completedChapters}</div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900">{currentModule.chapters.length}</div>
                    <div className="text-sm text-gray-500">Total Chapters</div>
                  </div>
                </div>
              </div>

              {/* Module pricing */}
              {!currentModule.isFree && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Premium Module</span>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    This module requires a separate purchase to access all content.
                  </p>
                  <div className="text-2xl font-bold text-yellow-900 mb-3">
                    ${currentModule.price}
                  </div>
                  <button className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700">
                    Purchase Module
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chapters list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Chapters</h3>
                <p className="text-gray-600 mt-1">
                  {currentModule.chapters.length} chapters in this module
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {currentModule.chapters
                  .sort((a, b) => a.order - b.order)
                  .map((chapter, index) => {
                    const chapterProgress = getChapterProgress(chapter.id);
                    const isCompleted = chapterProgress?.isCompleted || false;
                    const isAccessible = isChapterAccessible(chapter);
                    
                    return (
                      <div key={chapter.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          {/* Chapter number and status */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                            {isCompleted ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500">
                                {index + 1}
                              </div>
                            )}
                          </div>

                          {/* Chapter content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {getChapterIcon(chapter)}
                                  <h4 className="text-lg font-medium text-gray-900">
                                    {chapter.title}
                                  </h4>
                                  {!isAccessible && (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                
                                {chapter.description && (
                                  <p className="text-gray-600 mb-2">{chapter.description}</p>
                                )}

                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="capitalize">{chapter.type.toLowerCase()}</span>
                                  {chapter.duration && (
                                    <span className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{formatDuration(chapter.duration)}</span>
                                    </span>
                                  )}
                                  {chapterProgress && chapterProgress.completionPercentage > 0 && !isCompleted && (
                                    <span>{Math.round(chapterProgress.completionPercentage)}% complete</span>
                                  )}
                                </div>

                                {/* Progress bar for in-progress chapters */}
                                {chapterProgress && chapterProgress.completionPercentage > 0 && !isCompleted && (
                                  <div className="mt-2 w-1/2">
                                    <ProgressBar 
                                      progress={chapterProgress.completionPercentage} 
                                      size="sm"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Action button */}
                              <button
                                onClick={() => startLearning(chapter.id)}
                                disabled={!isAccessible}
                                className={`
                                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                                  ${isAccessible
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }
                                `}
                              >
                                <Play className="h-4 w-4" />
                                <span>{isCompleted ? 'Review' : 'Start'}</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Module completion card */}
            {moduleProgress === 100 && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Module Completed!</h3>
                    <p className="text-green-700">
                      Congratulations! You've completed all chapters in this module.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
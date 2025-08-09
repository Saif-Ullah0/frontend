// hooks/useCourseData.ts - Updated to work with your existing API
'use client';


import { fetchCourseById, fetchModuleOwnership } from '@/lib/api';

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
  order: number;
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

interface UseCourseDataReturn {
  course: Course | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  moduleOwnership: { [key: number]: boolean };
}

export function useCourseData(courseId: string): UseCourseDataReturn {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleOwnership, setModuleOwnership] = useState<{ [key: number]: boolean }>({});

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 useCourseData - Fetching course ${courseId}`);

      // Use your existing API function
      const courseData = await fetchCourseById(parseInt(courseId));
      
      if (!courseData) {
        throw new Error('Course not found');
      }

      console.log('✅ Course data loaded:', courseData);
      
      // Sort modules and chapters
      if (courseData.modules) {
        courseData.modules = courseData.modules
          .sort((a: Module, b: Module) => (a.orderIndex || a.order || 0) - (b.orderIndex || b.order || 0))
          .map((module: Module) => ({
            ...module,
            chapters: module.chapters?.sort((a: Chapter, b: Chapter) => a.order - b.order) || []
          }));
      }

      setCourse(courseData);

      // Fetch module ownership if there are paid modules
      const moduleIds = courseData.modules?.map(m => m.id) || [];
      if (moduleIds.length > 0) {
        console.log('🔍 Checking module ownership...');
        try {
          const ownership = await fetchModuleOwnership(moduleIds);
          setModuleOwnership(ownership);
          console.log('✅ Module ownership loaded:', ownership);
        } catch (ownershipError) {
          console.warn('⚠️ Could not fetch module ownership:', ownershipError);
          // Don't fail the whole request, just assume no ownership
        }
      }

    } catch (err) {
      console.error('❌ Error fetching course data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const refetch = () => {
    fetchCourseData();
  };

  return {
    course,
    loading,
    error,
    refetch,
    moduleOwnership
  };
}

// hooks/useProgress.ts - Simplified version that works with your API structure

import { useState, useEffect, useCallback } from 'react';

interface ChapterProgress {
  chapterId: string;
  isCompleted: boolean;
  watchTime: number;
  completionPercentage: number;
}

interface UseProgressReturn {
  progress: ChapterProgress[];
  loading: boolean;
  error: string | null;
  updateChapterProgress: (chapterId: string, progressData: Partial<ChapterProgress>) => Promise<void>;
  calculateCourseProgress: () => number;
  refetch: () => void;
}

export function useProgress(courseId: string): UseProgressReturn {
  const [progress, setProgress] = useState<ChapterProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if you have a progress endpoint in your API
      const response = await fetch(`http://localhost:5000/api/progress/course/${courseId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const progressData = await response.json();
        setProgress(progressData.chapters || []);
      } else if (response.status === 404) {
        // No progress yet, start with empty array
        setProgress([]);
      } else {
        throw new Error('Failed to load progress data');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      // For now, just start with empty progress if the endpoint doesn't exist
      setProgress([]);
      setError(null); // Don't show error for missing progress endpoint
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Update chapter progress
  const updateChapterProgress = useCallback(async (
    chapterId: string, 
    progressData: Partial<ChapterProgress>
  ) => {
    try {
      // Optimistic update
      setProgress(currentProgress => {
        const existingIndex = currentProgress.findIndex(p => p.chapterId === chapterId);
        const updatedProgress = {
          chapterId,
          isCompleted: false,
          watchTime: 0,
          completionPercentage: 0,
          ...progressData
        };

        if (existingIndex >= 0) {
          const newProgress = [...currentProgress];
          newProgress[existingIndex] = {
            ...newProgress[existingIndex],
            ...updatedProgress
          };
          return newProgress;
        } else {
          return [...currentProgress, updatedProgress];
        }
      });

      // Try to send to server (create this endpoint in your backend if needed)
      try {
        const response = await fetch('http://localhost:5000/api/progress/chapter', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chapterId,
            ...progressData
          }),
        });

        if (!response.ok) {
          console.warn('Failed to save progress to server, keeping local progress');
        }
      } catch (saveError) {
        console.warn('Could not save progress to server:', saveError);
        // Keep the optimistic update even if server save fails
      }
      
    } catch (err) {
      console.error('Error updating chapter progress:', err);
      throw err;
    }
  }, []);

  // Calculate overall course progress
  const calculateCourseProgress = useCallback((): number => {
    if (progress.length === 0) return 0;

    const totalProgress = progress.reduce((sum, chapter) => {
      return sum + chapter.completionPercentage;
    }, 0);

    return totalProgress / progress.length;
  }, [progress]);

  // Fetch progress on mount
  useEffect(() => {
    if (courseId) {
      fetchProgress();
    }
  }, [courseId, fetchProgress]);

  return {
    progress,
    loading,
    error,
    updateChapterProgress,
    calculateCourseProgress,
    refetch: fetchProgress
  };
}
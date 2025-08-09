// hooks/useProgress.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface ChapterProgress {
  chapterId: string;
  isCompleted: boolean;
  watchTime: number;
  completionPercentage: number;
}

interface ModuleProgress {
  moduleId: number;
  completedChapters: number;
  totalChapters: number;
  averageProgress: number;
}

interface CourseProgress {
  courseId: string;
  completedChapters: number;
  totalChapters: number;
  completedModules: number;
  totalModules: number;
  overallProgress: number;
}

interface UseProgressReturn {
  progress: ChapterProgress[];
  courseProgress: CourseProgress | null;
  loading: boolean;
  error: string | null;
  updateChapterProgress: (chapterId: string, progressData: Partial<ChapterProgress>) => Promise<void>;
  calculateModuleProgress: (moduleId: number) => number;
  calculateCourseProgress: () => number;
  refetch: () => void;
}

export function useProgress(courseId: string): UseProgressReturn {
  const [progress, setProgress] = useState<ChapterProgress[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/progress/course/${courseId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view progress');
        } else if (response.status === 404) {
          // No progress yet, start with empty array
          setProgress([]);
          setCourseProgress(null);
          return;
        } else {
          throw new Error('Failed to load progress data');
        }
      }

      const progressData = await response.json();
      setProgress(progressData.chapters || []);
      setCourseProgress(progressData.course || null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
          // Update existing progress
          const newProgress = [...currentProgress];
          newProgress[existingIndex] = {
            ...newProgress[existingIndex],
            ...updatedProgress
          };
          return newProgress;
        } else {
          // Add new progress entry
          return [...currentProgress, updatedProgress];
        }
      });

      // Send to server
      const response = await fetch('/api/progress/chapter', {
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
        throw new Error('Failed to update progress');
      }

      // Optionally refetch to get updated course progress
      // You might want to calculate this client-side for better performance
      
    } catch (err) {
      console.error('Error updating chapter progress:', err);
      // Revert optimistic update on error
      await fetchProgress();
      throw err;
    }
  }, [fetchProgress]);

  // Calculate module progress
  const calculateModuleProgress = useCallback((moduleId: number): number => {
    // This would need access to course data to know which chapters belong to the module
    // For now, we'll calculate based on available progress data
    // In a real implementation, you'd pass the course data or chapters to this hook
    
    const moduleChapters = progress.filter(p => {
      // You'll need to determine which chapters belong to this module
      // This might require passing additional data or fetching it
      return true; // Placeholder
    });

    if (moduleChapters.length === 0) return 0;

    const totalProgress = moduleChapters.reduce((sum, chapter) => {
      return sum + chapter.completionPercentage;
    }, 0);

    return totalProgress / moduleChapters.length;
  }, [progress]);

  // Calculate overall course progress
  const calculateCourseProgress = useCallback((): number => {
    if (progress.length === 0) return 0;

    const totalProgress = progress.reduce((sum, chapter) => {
      return sum + chapter.completionPercentage;
    }, 0);

    return totalProgress / progress.length;
  }, [progress]);

  // Fetch progress on mount and when courseId changes
  useEffect(() => {
    if (courseId) {
      fetchProgress();
    }
  }, [courseId, fetchProgress]);

  return {
    progress,
    courseProgress,
    loading,
    error,
    updateChapterProgress,
    calculateModuleProgress,
    calculateCourseProgress,
    refetch: fetchProgress
  };
}

// Helper hook for auto-saving progress with debouncing
export function useAutoSaveProgress(
  chapterId: string,
  onSave: (progressData: Partial<ChapterProgress>) => Promise<void>
) {
  const [pendingProgress, setPendingProgress] = useState<Partial<ChapterProgress> | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<number>(0);

  useEffect(() => {
    if (!pendingProgress) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await onSave(pendingProgress);
        setLastSavedTime(Date.now());
        setPendingProgress(null);
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Keep pending progress for retry
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(saveTimeout);
  }, [pendingProgress, onSave]);

  const queueProgressUpdate = useCallback((progressData: Partial<ChapterProgress>) => {
    setPendingProgress(current => ({
      ...current,
      ...progressData
    }));
  }, []);

  return {
    queueProgressUpdate,
    lastSavedTime,
    isPending: !!pendingProgress
  };
}
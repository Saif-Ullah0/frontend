// app/courses/[id]/modules/[moduleId]/chapters/[chapterId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, SkipForward, SkipBack, BookOpen, MessageSquare, PlusCircle } from 'lucide-react';
import ChapterContentViewer from '@/components/learning/ChapterContentViewer';
import ProgressBar from '@/components/ui/ProgressBar';
import { useCourseData } from '@/hooks/useCourseData';
import { useProgress } from '@/hooks/useProgress';

interface Note {
  id: string;
  content: string;
  timestamp: number; // For video chapters, timestamp in seconds
  createdAt: string;
}

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const moduleId = parseInt(params.moduleId as string);
  const chapterId = params.chapterId as string;

  const { course, loading, error } = useCourseData(courseId);
  const { progress, updateChapterProgress } = useProgress(courseId);

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Get current chapter and related data
  const currentModule = course?.modules.find(m => m.id === moduleId);
  const currentChapter = currentModule?.chapters.find(ch => ch.id === chapterId);
  const chapterProgress = progress.find(p => p.chapterId === chapterId);

  // Get adjacent chapters for navigation
  const getAllChapters = () => {
    if (!course) return [];
    const allChapters: any[] = [];
    course.modules.forEach(module => {
      module.chapters.forEach(chapter => allChapters.push({ ...chapter, moduleId: module.id }));
    });
    return allChapters.sort((a, b) => a.order - b.order);
  };

  const allChapters = getAllChapters();
  const currentChapterIndex = allChapters.findIndex(ch => ch.id === chapterId);
  const nextChapter = allChapters[currentChapterIndex + 1];
  const prevChapter = allChapters[currentChapterIndex - 1];

  // Navigation functions
  const navigateToChapter = (targetChapterId: string) => {
    const targetChapter = allChapters.find(ch => ch.id === targetChapterId);
    if (targetChapter) {
      router.push(`/courses/${courseId}/modules/${targetChapter.moduleId}/chapters/${targetChapterId}`);
    }
  };

  const goToLearningInterface = () => {
    router.push(`/courses/${courseId}/learn?chapter=${chapterId}`);
  };

  // Handle progress updates
  const handleProgressUpdate = async (progressData: Partial<any>) => {
    try {
      await updateChapterProgress(chapterId, progressData);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // Handle chapter completion
  const handleChapterComplete = () => {
    // Auto-advance to next chapter or show completion message
    if (nextChapter) {
      setTimeout(() => {
        navigateToChapter(nextChapter.id);
      }, 2000);
    }
  };

  // Notes functionality
  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        timestamp: 0, // You could get current video time here
        createdAt: new Date().toISOString()
      };
      setNotes([...notes, note]);
      setNewNote('');
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !course || !currentModule || !currentChapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chapter Not Found</h1>
          <p className="text-gray-600 mb-4">The chapter you're looking for doesn't exist or you don't have access.</p>
          <button 
            onClick={() => router.push(`/courses/${courseId}/modules/${moduleId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Module
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/courses/${courseId}/modules/${moduleId}`)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {currentChapter.title}
                </h1>
                <p className="text-sm text-gray-500">{currentModule.title}</p>
              </div>
            </div>

            {/* Center - Progress */}
            <div className="flex-1 max-w-md mx-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {Math.round(chapterProgress?.completionPercentage || 0)}%
                </span>
                <ProgressBar 
                  progress={chapterProgress?.completionPercentage || 0} 
                  className="flex-1" 
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  Complete
                </span>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2">
              {/* Navigation buttons */}
              <button
                onClick={() => prevChapter && navigateToChapter(prevChapter.id)}
                disabled={!prevChapter}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Chapter"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={() => nextChapter && navigateToChapter(nextChapter.id)}
                disabled={!nextChapter}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Chapter"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              {/* Notes toggle */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 rounded-lg transition-colors ${
                  showNotes 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Toggle Notes"
              >
                <MessageSquare className="h-5 w-5" />
              </button>

              {/* Learning interface button */}
              <button
                onClick={goToLearningInterface}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
              >
                Learning Mode
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Chapter content */}
        <main className={`flex-1 overflow-hidden transition-all duration-300 ${
          showNotes ? 'mr-80' : 'mr-0'
        }`}>
          <ChapterContentViewer
            chapter={currentChapter}
            progress={chapterProgress}
            onProgressUpdate={handleProgressUpdate}
            onComplete={handleChapterComplete}
            nextChapter={nextChapter}
            prevChapter={prevChapter}
            onNavigate={navigateToChapter}
          />
        </main>

        {/* Notes sidebar */}
        {showNotes && (
          <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Notes header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                <button
                  onClick={() => setShowNotes(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Chapter notes and observations
              </p>
            </div>

            {/* Add note */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this chapter..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-4">
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No notes yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Add notes to remember key points
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
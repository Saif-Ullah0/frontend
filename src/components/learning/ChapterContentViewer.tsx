// components/learning/ChapterContentViewer.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Clock, CheckCircle, FileText, Video } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

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

interface ChapterContentViewerProps {
  chapter: Chapter;
  progress?: ChapterProgress;
  onProgressUpdate: (progressData: Partial<ChapterProgress>) => void;
  onComplete: () => void;
  nextChapter?: Chapter | null;
  prevChapter?: Chapter | null;
  onNavigate: (chapterId: string) => void;
}

export default function ChapterContentViewer({
  chapter,
  progress,
  onProgressUpdate,
  onComplete,
  nextChapter,
  prevChapter,
  onNavigate
}: ChapterContentViewerProps) {
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Progress tracking
  const [watchTime, setWatchTime] = useState(progress?.watchTime || 0);
  const [completionPercentage, setCompletionPercentage] = useState(progress?.completionPercentage || 0);
  const [isCompleted, setIsCompleted] = useState(progress?.isCompleted || false);
  
  // Auto-save progress
  const progressUpdateRef = useRef<NodeJS.Timeout>();

  // Initialize video on chapter change
  useEffect(() => {
    if (chapter.type === 'VIDEO' && videoRef.current) {
      const video = videoRef.current;
      
      // Set initial time from progress
      if (progress?.watchTime) {
        video.currentTime = progress.watchTime;
      }
      
      // Reset state
      setCurrentTime(progress?.watchTime || 0);
      setWatchTime(progress?.watchTime || 0);
      setCompletionPercentage(progress?.completionPercentage || 0);
      setIsCompleted(progress?.isCompleted || false);
    }
  }, [chapter.id, progress]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      setCurrentTime(current);
      setWatchTime(Math.max(watchTime, current));
      
      if (total > 0) {
        const percentage = (current / total) * 100;
        setCompletionPercentage(Math.max(completionPercentage, percentage));
        
        // Auto-complete at 90%
        if (percentage >= 90 && !isCompleted) {
          setIsCompleted(true);
          onComplete();
        }
      }
      
      // Debounced progress update
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }
      
      progressUpdateRef.current = setTimeout(() => {
        onProgressUpdate({
          watchTime: Math.max(watchTime, current),
          completionPercentage: total > 0 ? Math.max(completionPercentage, (current / total) * 100) : 0,
          isCompleted: total > 0 && (current / total) >= 0.9
        });
      }, 2000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeVolume = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Text content progress (reading time estimation)
  useEffect(() => {
    if (chapter.type === 'TEXT' && !isCompleted) {
      // Simulate reading progress
      const words = chapter.content?.split(' ').length || 0;
      const readingTimeSeconds = Math.max((words / 200) * 60, 30); // 200 words per minute, min 30 seconds
      
      const timer = setTimeout(() => {
        setCompletionPercentage(100);
        setIsCompleted(true);
        onProgressUpdate({
          completionPercentage: 100,
          isCompleted: true
        });
        onComplete();
      }, readingTimeSeconds * 1000);

      return () => clearTimeout(timer);
    }
  }, [chapter.id, chapter.type, isCompleted]);

  const getChapterIcon = () => {
    switch (chapter.type) {
      case 'VIDEO':
        return <Video className="h-5 w-5" />;
      case 'TEXT':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chapter header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getChapterIcon()}
                <h1 className="text-2xl font-bold text-gray-900">{chapter.title}</h1>
                {isCompleted && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
              {chapter.description && (
                <p className="text-gray-600 mb-4">{chapter.description}</p>
              )}
              
              {/* Progress info */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {chapter.duration && (
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(chapter.duration)}</span>
                  </span>
                )}
                <span>•</span>
                <span>{Math.round(completionPercentage)}% complete</span>
                {chapter.type === 'VIDEO' && watchTime > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatTime(watchTime)} watched</span>
                  </>
                )}
              </div>
              
              {/* Progress bar */}
              {completionPercentage > 0 && (
                <div className="mt-3">
                  <ProgressBar progress={completionPercentage} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          {chapter.type === 'VIDEO' && chapter.videoUrl ? (
            /* Video Player */
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  src={chapter.videoUrl}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  poster="/api/placeholder/800/450"
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Video controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="relative">
                      <div className="h-1 bg-white/30 rounded-full">
                        <div 
                          className="h-1 bg-blue-500 rounded-full transition-all"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* Control buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={togglePlay}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-gray-300"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => changeVolume(Number(e.target.value))}
                          className="w-16"
                        />
                      </div>
                      
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-white hover:text-gray-300"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Text Content */
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: chapter.content || 'No content available.' }}
              />
            </div>
          )}

          {/* Chapter navigation */}
          <div className="flex justify-between items-center">
            <div>
              {prevChapter && (
                <button
                  onClick={() => onNavigate(prevChapter.id)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SkipBack className="h-4 w-4" />
                  <span>Previous: {prevChapter.title}</span>
                </button>
              )}
            </div>
            
            <div>
              {nextChapter && (
                <button
                  onClick={() => onNavigate(nextChapter.id)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Next: {nextChapter.title}</span>
                  <SkipForward className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCw, CheckCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoId?: number; // 🆕 CHANGED: Make optional since we'll use videoUrl
  chapterId?: string;
  courseId?: number; 
  title: string;
  videoUrl: string; // 🆕 NEW: Use the provided video URL directly
  thumbnailUrl?: string;
  onProgress?: (videoId: number, currentTime: number, duration: number, progress: number) => void;
  onChapterProgress?: (chapterId: string, progress: number, isCompleted: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  chapterId,
  courseId,
  title, 
  videoUrl, // 🆕 NEW: Use this directly
  thumbnailUrl, 
  onProgress,
  onChapterProgress
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Auto-completion states
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);

  // 🆕 NEW: Validate video URL
  useEffect(() => {
    console.log('🎥 VideoPlayer props:', {
      videoId,
      chapterId,
      courseId,
      videoUrl,
      title
    });

    if (!videoUrl) {
      setError('No video URL provided');
      setIsLoading(false);
    }
  }, [videoId, chapterId, courseId, videoUrl, title]);

  // 🆕 NEW: Progress update function
  const updateProgressOnServer = async (progress: number, isCompleted: boolean) => {
    if (!chapterId || !courseId) return;

    try {
      const response = await fetch('/api/progress/chapter', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: courseId,
          chapterId: chapterId,
          isCompleted: isCompleted,
          watchTime: currentTime,
          completionPercentage: progress
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Progress saved:', result);
      } else {
        console.error('❌ Failed to save progress:', response.status);
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      console.log('✅ Video loaded successfully:', video.duration, 'seconds');
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      const progress = video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0;
      
      // Auto-completion at 90%
      if (progress >= 90 && !isCompleted) {
        setIsCompleted(true);
        setShowCompletionMessage(true);
        
        // Update server with completion
        updateProgressOnServer(progress, true);
        
        // Auto-hide completion message after 3 seconds
        setTimeout(() => setShowCompletionMessage(false), 3000);
        
        console.log('🎉 Video auto-completed at 90%');
      } else if (progress > 0) {
        // Save progress every 10% increment
        const roundedProgress = Math.floor(progress / 10) * 10;
        if (roundedProgress > lastSavedProgress) {
          updateProgressOnServer(progress, false);
          setLastSavedProgress(roundedProgress);
        }
      }
      
      // Call original callbacks
      if (onProgress && video.duration > 0 && videoId) {
        onProgress(videoId, video.currentTime, video.duration, progress);
      }
      
      if (chapterId && onChapterProgress && !isCompleted) {
        onChapterProgress(chapterId, progress, false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Mark as completed when video actually ends
      if (!isCompleted) {
        setIsCompleted(true);
        updateProgressOnServer(100, true);
        
        if (chapterId && onChapterProgress) {
          onChapterProgress(chapterId, 100, true);
        }
      }
    };

    const handleError = (e: any) => {
      console.error('❌ Video error:', e);
      setError('Failed to load video');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      console.log('✅ Video can play');
    };

    const handleLoadStart = () => {
      console.log('🔄 Video loading started...');
      setIsLoading(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [videoUrl, chapterId, courseId, onProgress, onChapterProgress, isCompleted, currentTime, lastSavedProgress, videoId]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => {
        console.error('❌ Error playing video:', err);
        setError('Failed to play video');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const video = videoRef.current;
    if (!progressBar || !video) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen().catch(() => {
        console.error('Failed to enter fullscreen');
      });
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (timeInSeconds: number): string => {
    if (!timeInSeconds || timeInSeconds < 0) return '0:00';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 🆕 NEW: Better error handling
  if (error) {
    return (
      <div className="w-full bg-gray-900 rounded-lg p-8 text-center">
        <div className="text-red-400 mb-2">Error loading video</div>
        <div className="text-gray-400 text-sm mb-4">{error}</div>
        <div className="text-gray-500 text-xs mb-4">Video URL: {videoUrl}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RotateCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }

  // 🆕 NEW: Show if no video URL
  if (!videoUrl) {
    return (
      <div className="w-full bg-gray-900 rounded-lg p-8 text-center">
        <div className="text-yellow-400 mb-2">No video available</div>
        <div className="text-gray-400 text-sm">This chapter doesn't have a video yet.</div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden group shadow-lg"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-auto max-h-96"
        poster={thumbnailUrl}
        onClick={togglePlay}
        preload="metadata"
        crossOrigin="use-credentials"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Completion Message Overlay */}
      {showCompletionMessage && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg flex items-center gap-3 animate-pulse">
            <CheckCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold">Chapter Completed!</div>
              <div className="text-sm opacity-90">Great job! You've finished this video.</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white flex items-center">
            <RotateCw className="w-6 h-6 animate-spin mr-2" />
            Loading video...
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-60 text-white rounded-full p-4 hover:bg-opacity-80 transition-all transform hover:scale-110"
          >
            <Play className="w-12 h-12" />
          </button>
        </div>
      )}

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" />
          Completed
        </div>
      )}

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div
            ref={progressRef}
            className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Completion Status */}
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Playback Speed */}
            <div className="relative group">
              <button className="text-white hover:text-blue-400 transition-colors flex items-center space-x-1">
                <span className="text-sm">{playbackRate}x</span>
              </button>
              
              <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white text-sm mb-2">Speed</div>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`block w-full text-left px-3 py-1 text-sm rounded ${
                      playbackRate === rate ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Title Overlay */}
      {title && (
        <div className="absolute top-4 left-4 text-white bg-black bg-opacity-60 px-3 py-1 rounded">
          <div className="font-medium">{title}</div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  PlayIcon, 
  ArrowLeftIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import CommentSection from '@/components/comments/CommentSection';

interface Video {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  isPublished: boolean;
  course: {
    id: number;
    title: string;
  };
  module?: {
    id: number;
    title: string;
  };
  chapter?: {
    id: string;
    title: string;
  };
}

export default function VideoViewPage() {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasShownPopupRef = useRef(false); // Prevent multiple pop-ups
  const router = useRouter();
  const params = useParams();
  const videoId = params.id;

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          setError('Video not found');
          return;
        }
        throw new Error('Failed to fetch video');
      }

      const data = await response.json();
      setVideo(data);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  // Handle video progress and show pop-up at 90%
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      if (progress >= 90 && !hasShownPopupRef.current) {
        hasShownPopupRef.current = true; // Prevent multiple pop-ups
        setShowCompletionPopup(true); // Show pop-up
        setTimeout(() => setShowCompletionPopup(false), 3000); // Auto-hide after 3 seconds
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [video]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading video...</span>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4 text-xl">⚠️ {error || 'Video not found'}</div>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue- AAC600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
      {/* Completion Pop-up */}
      {showCompletionPopup && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Video marked as completed!</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <PlayIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{video.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>{video.course.title}</span>
                  {video.module && (
                    <>
                      <span>•</span>
                      <BookOpenIcon className="w-4 h-4" />
                      <span>{video.module.title}</span>
                    </>
                  )}
                  {video.duration && (
                    <>
                      <span>•</span>
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatDuration(video.duration)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden">
              {video.videoUrl ? (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-auto max-h-[500px]"
                  src={video.videoUrl.startsWith('http') ? video.videoUrl : `http://localhost:5000${video.videoUrl}`}
                  poster="/api/placeholder/800/450"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <PlayIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Video not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Description */}
            {video.description && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">About this video</h3>
                <p className="text-gray-300 leading-relaxed">{video.description}</p>
              </div>
            )}

            {/* Comments Section */}
            <CommentSection
              resourceType="VIDEO"
              resourceId={video.id}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Course Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Course</div>
                  <div className="font-medium">{video.course.title}</div>
                </div>
                {video.module && (
                  <div>
                    <div className="text-sm text-gray-400">Module</div>
                    <div className="font-medium">{video.module.title}</div>
                  </div>
                )}
                {video.chapter && (
                  <div>
                    <div className="text-sm text-gray-400">Chapter</div>
                    <div className="font-medium">{video.chapter.title}</div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => router.push(`/courses/${video.course.id}`)}
                className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Course
              </button>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Quick Navigation</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/my-courses')}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  My Courses
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <AcademicCapIcon className="w-4 h-4" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
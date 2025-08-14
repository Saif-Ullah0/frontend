// src/components/learning/CourseContentNavigation.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlayIcon, 
  DocumentIcon,
  ChevronRightIcon,
  BookOpenIcon,
  VideoCameraIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface Video {
  id: number;
  title: string;
  description?: string;
  duration?: number;
  isPublished: boolean;
  orderIndex: number;
}

interface Note {
  id: number;
  title: string;
  description?: string;
  fileType?: string;
  fileSize?: string;
  isPublished: boolean;
  orderIndex: number;
  downloadCount: number;
}

interface CourseContentNavigationProps {
  courseId: number;
  moduleId?: number;
  chapterId?: string;
  className?: string;
}

export default function CourseContentNavigation({ 
  courseId, 
  moduleId, 
  chapterId,
  className = "" 
}: CourseContentNavigationProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchContent();
  }, [courseId, moduleId, chapterId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Build the API URL based on available parameters
      let videosUrl = `http://localhost:5000/api/videos/course/${courseId}`;
      let notesUrl = `http://localhost:5000/api/notes/course/${courseId}`;
      
      if (moduleId) {
        videosUrl += `/module/${moduleId}`;
        notesUrl += `/module/${moduleId}`;
      }
      
      if (chapterId) {
        videosUrl += `/chapter/${chapterId}`;
        notesUrl += `/chapter/${chapterId}`;
      }

      const [videosResponse, notesResponse] = await Promise.all([
        fetch(videosUrl, { credentials: 'include' }),
        fetch(notesUrl, { credentials: 'include' })
      ]);

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.filter((v: Video) => v.isPublished).sort((a, b) => a.orderIndex - b.orderIndex));
      }

      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData.filter((n: Note) => n.isPublished).sort((a, b) => a.orderIndex - b.orderIndex));
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: string): string => {
    if (!bytes) return '0 B';
    const num = parseInt(bytes);
    if (!num) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <DocumentIcon className="w-4 h-4 text-red-400" />;
      case 'doc':
      case 'docx':
        return <DocumentIcon className="w-4 h-4 text-blue-400" />;
      case 'txt':
        return <DocumentIcon className="w-4 h-4 text-gray-400" />;
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading content...</span>
        </div>
      </div>
    );
  }

  if (videos.length === 0 && notes.length === 0) {
    return (
      <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
        <div className="text-center py-8">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No content available for this section</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <BookOpenIcon className="w-5 h-5 text-blue-400" />
        Course Content
      </h3>

      <div className="space-y-6">
        {/* Videos Section */}
        {videos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <VideoCameraIcon className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-white">Videos ({videos.length})</h4>
            </div>
            
            <div className="space-y-2">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => router.push(`/videos/${video.id}`)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                      <PlayIcon className="w-4 h-4 text-purple-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                        {video.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        {video.duration && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <ClockIcon className="w-3 h-3" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        )}
                        {video.description && (
                          <span className="text-xs text-gray-500 truncate max-w-xs">
                            {video.description}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {notes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DocumentIcon className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-white">Notes & Documents ({notes.length})</h4>
            </div>
            
            <div className="space-y-2">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => router.push(`/notes/${note.id}`)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                      {getFileIcon(note.fileType)}
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                        {note.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {note.fileType?.toUpperCase() || 'TEXT'}
                        </span>
                        {note.fileSize && (
                          <>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">
                              {formatFileSize(note.fileSize)}
                            </span>
                          </>
                        )}
                        <span className="text-xs text-gray-500">•</span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <ArrowDownTrayIcon className="w-3 h-3" />
                          <span>{note.downloadCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
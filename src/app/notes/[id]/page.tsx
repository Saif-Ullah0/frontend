// src/app/notes/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  DocumentIcon, 
  ArrowLeftIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import CommentSection from '@/components/comments/CommentSection';

interface Note {
  id: number;
  title: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  downloadCount: number;
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
    id: number;
    title: string;
  };
}

export default function NoteViewPage() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const noteId = params.id;

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          setError('Note not found');
          return;
        }
        throw new Error('Failed to fetch note');
      }

      const data = await response.json();
      setNote(data);
    } catch (err) {
      console.error('Error fetching note:', err);
      setError('Failed to load note');
    } finally {
      setLoading(false);
    }
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
        return <DocumentIcon className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentIcon className="w-5 h-5 text-blue-500" />;
      case 'txt':
        return <DocumentIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading note...</span>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4 text-xl">⚠️ {error || 'Note not found'}</div>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white">
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
                {getFileIcon(note.fileType)}
              </div>
              <div>
                <h1 className="text-xl font-semibold">{note.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>{note.course.title}</span>
                  {note.module && (
                    <>
                      <span>•</span>
                      <BookOpenIcon className="w-4 h-4" />
                      <span>{note.module.title}</span>
                    </>
                  )}
                  {note.fileName && (
                    <>
                      <span>•</span>
                      <span>{note.fileName} ({formatFileSize(note.fileSize)})</span>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Actions */}
            {note.fileUrl && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(note.fileType)}
                    <div>
                      <h3 className="font-semibold">{note.fileName || note.title}</h3>
                      <p className="text-sm text-gray-400">
                        {note.fileType?.toUpperCase()} • {formatFileSize(note.fileSize)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {note.fileType === 'pdf' && (
                      <a
                        href={`http://localhost:5000${note.fileUrl.replace('/download/', '/view/')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View PDF
                      </a>
                    )}
                    <a
                      href={`http://localhost:5000${note.fileUrl}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Note Description */}
            {note.description && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-gray-300 leading-relaxed">{note.description}</p>
              </div>
            )}

            {/* Note Content */}
            {note.content && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Content</h3>
                <div 
                  className="prose prose-lg max-w-none text-gray-300 prose-headings:text-white prose-links:text-blue-400 prose-strong:text-white"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            )}

            {/* Comments Section */}
            <CommentSection
              resourceType="NOTE"
              resourceId={note.id}
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
                  <div className="font-medium">{note.course.title}</div>
                </div>
                {note.module && (
                  <div>
                    <div className="text-sm text-gray-400">Module</div>
                    <div className="font-medium">{note.module.title}</div>
                  </div>
                )}
                {note.chapter && (
                  <div>
                    <div className="text-sm text-gray-400">Chapter</div>
                    <div className="font-medium">{note.chapter.title}</div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => router.push(`/courses/${note.course.id}`)}
                className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Course
              </button>
            </div>

            {/* File Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">File Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Downloads</span>
                  <span className="font-medium">{note.downloadCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">File Type</span>
                  <span className="font-medium">{note.fileType?.toUpperCase() || 'TEXT'}</span>
                </div>
                {note.fileSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">File Size</span>
                    <span className="font-medium">{formatFileSize(note.fileSize)}</span>
                  </div>
                )}
              </div>
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
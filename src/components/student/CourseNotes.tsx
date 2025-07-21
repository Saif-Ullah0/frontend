// frontend/src/components/student/CourseNotes.tsx
"use client";

import { useEffect, useState } from 'react';
import { 
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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
  orderIndex: number;
  moduleId?: number;
  createdAt: string;
  module?: {
    title: string;
  };
}

interface CourseNotesProps {
  courseId: number;
  courseName: string;
}

export default function CourseNotes({ courseId, courseName }: CourseNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [courseId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/notes/course/${courseId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      setNotes(data);
      
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load course materials');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: string): string => {
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
        return <DocumentIcon className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentIcon className="w-6 h-6 text-blue-500" />;
      case 'txt':
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
      case 'ppt':
      case 'pptx':
        return <DocumentIcon className="w-6 h-6 text-orange-500" />;
      default:
        return <BookOpenIcon className="w-6 h-6 text-blue-400" />;
    }
  };

  const getFileTypeColor = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'doc':
      case 'docx':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'txt':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'ppt':
      case 'pptx':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-white">Loading course materials...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">⚠️ {error}</div>
          <button
            onClick={fetchNotes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
        <div className="text-center">
          <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">No Materials Available</h3>
          <p className="text-gray-400">Course materials will appear here when available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpenIcon className="w-6 h-6 text-blue-400" />
          Course Materials
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          {notes.length} materials available for {courseName}
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
              <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="flex-shrink-0 p-3 bg-white/10 rounded-lg">
                  {getFileIcon(note.fileType)}
                </div>

                {/* Note Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white text-lg line-clamp-1">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-2 ml-4">
                      {note.fileType && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getFileTypeColor(note.fileType)}`}>
                          {note.fileType.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {note.description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {note.description}
                    </p>
                  )}

                  {note.content && !note.fileUrl && (
                    <div className="text-gray-300 text-sm mb-3 line-clamp-3">
                      {note.content}
                    </div>
                  )}

                  {note.module && (
                    <div className="text-xs text-blue-400 mb-3 flex items-center gap-1">
                      <BookOpenIcon className="w-3 h-3" />
                      Module: {note.module.title}
                    </div>
                  )}

                  {/* File Info */}
                  {note.fileUrl && (
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <DocumentIcon className="w-3 h-3" />
                        {note.fileName}
                      </span>
                      {note.fileSize && (
                        <span>{formatFileSize(note.fileSize)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {note.fileUrl && (
                    <div className="flex items-center gap-2">
                      {note.fileType === 'pdf' && (
                        <a
                          href={`http://localhost:5000${note.fileUrl.replace('/download/', '/view/')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View PDF
                        </a>
                      )}
                      <a
                        href={`http://localhost:5000${note.fileUrl}`}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
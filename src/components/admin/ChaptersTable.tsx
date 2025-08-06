// frontend/src/components/admin/ChaptersTable.tsx
"use client";

import { useState } from 'react';
import { 
  BookOpenIcon, 
  PlayIcon, 
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface Chapter {
  id: number;
  title: string;
  description: string;
  moduleId: number;
  type: 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ';
  order: number;
  publishStatus: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
  module: {
    id: number;
    title: string;
    course?: {
      id: number;
      title: string;
    };
  };
}

interface ChaptersTableProps {
  chapters: Chapter[];
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: number, chapterTitle: string) => Promise<void>;
  onToggleStatus: (chapterId: number, currentStatus: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function ChaptersTable({ 
  chapters, 
  onEditChapter, 
  onDeleteChapter,
  onToggleStatus,
  onRefresh 
}: ChaptersTableProps) {
  const [actioningChapters, setActioningChapters] = useState<Set<number>>(new Set());

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayIcon className="h-4 w-4" />;
      case 'TEXT':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'PDF':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'QUIZ':
        return <PencilIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'bg-purple-100 text-purple-800 bg-opacity-20';
      case 'TEXT':
        return 'bg-blue-100 text-blue-800 bg-opacity-20';
      case 'PDF':
        return 'bg-green-100 text-green-800 bg-opacity-20';
      case 'QUIZ':
        return 'bg-orange-100 text-orange-800 bg-opacity-20';
      default:
        return 'bg-gray-100 text-gray-800 bg-opacity-20';
    }
  };

  const handleToggleStatus = async (chapterId: number, currentStatus: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const action = currentStatus === 'PUBLISHED' ? 'unpublish' : 'publish';
    
    if (!confirm(`Are you sure you want to ${action} "${chapter.title}"?`)) {
      return;
    }

    setActioningChapters(prev => new Set(prev).add(chapterId));
    
    try {
      await onToggleStatus(chapterId, currentStatus);
    } finally {
      setActioningChapters(prev => {
        const newSet = new Set(prev);
        newSet.delete(chapterId);
        return newSet;
      });
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    if (!confirm(`Are you sure you want to delete "${chapter.title}"? This action cannot be undone.`)) {
      return;
    }

    setActioningChapters(prev => new Set(prev).add(chapterId));
    
    try {
      await onDeleteChapter(chapterId, chapter.title);
    } finally {
      setActioningChapters(prev => {
        const newSet = new Set(prev);
        newSet.delete(chapterId);
        return newSet;
      });
    }
  };

  if (chapters.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
        <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No chapters found</h3>
        <p className="text-gray-400 mb-4">Try adjusting your search criteria or add some chapters.</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Chapters ({chapters.length})</h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Chapter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Module & Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {chapters.map((chapter) => (
              <tr 
                key={chapter.id} 
                className="hover:bg-white/5 transition-colors duration-200"
              >
                {/* Chapter Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium text-sm">#{chapter.order}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {chapter.title}
                      </div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {chapter.description}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Module & Course */}
                <td className="px-6 py-4">
                  <div className="text-sm text-white">{chapter.module.title}</div>
                  {chapter.module.course && (
                    <div className="text-xs text-blue-400 mt-1">
                      {chapter.module.course.title}
                    </div>
                  )}
                </td>

                {/* Content Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContentColor(chapter.type)}`}>
                    {getContentIcon(chapter.type)}
                    <span className="ml-1">{chapter.type}</span>
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {chapter.publishStatus === 'PUBLISHED' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 bg-opacity-20">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 bg-opacity-20">
                      <EyeSlashIcon className="h-3 w-3 mr-1" />
                      Draft
                    </span>
                  )}
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(chapter.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => onEditChapter(chapter)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>

                    {/* Publish/Unpublish Button */}
                    <button
                      onClick={() => handleToggleStatus(chapter.id, chapter.publishStatus)}
                      disabled={actioningChapters.has(chapter.id)}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        chapter.publishStatus === 'PUBLISHED' 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {actioningChapters.has(chapter.id) ? (
                        <>
                          <div className="animate-spin h-3 w-3 mr-1 border border-white border-t-transparent rounded-full"></div>
                          Working...
                        </>
                      ) : (
                        <>
                          {chapter.publishStatus === 'PUBLISHED' ? (
                            <>
                              <EyeSlashIcon className="h-3 w-3 mr-1" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <EyeIcon className="h-3 w-3 mr-1" />
                              Publish
                            </>
                          )}
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      disabled={actioningChapters.has(chapter.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            Total: {chapters.length} chapters
          </div>
          <button
            onClick={onRefresh}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
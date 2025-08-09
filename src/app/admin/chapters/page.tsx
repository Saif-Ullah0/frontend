"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ChaptersTable from '@/components/admin/ChaptersTable';
import ChaptersStats from '@/components/admin/ChaptersStats';
import ChapterModal from '@/components/admin/ChapterModal';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface Chapter {
  id: string; // Changed to string to match Prisma schema
  title: string;
  description: string;
  content?: string;
  videoUrl?: string;
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

interface Course {
  id: number;
  title: string;
}

interface Module {
  id: number;
  title: string;
  courseId: number; // Added courseId to match ChapterModal
  course?: {
    id: number;
    title: string;
  };
}

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [moduleFilter, setModuleFilter] = useState<'ALL' | number>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterChapters();
  }, [chapters, searchTerm, statusFilter, moduleFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch courses
      const coursesRes = await fetch('http://localhost:5000/api/admin/courses', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!coursesRes.ok) {
        if (coursesRes.status === 401) {
          router.push('/login');
          return;
        }
        if (coursesRes.status === 403) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch courses');
      }

      const coursesData = await coursesRes.json();
      setCourses(Array.isArray(coursesData) ? coursesData : []);

      // Fetch modules
      const modulesRes = await fetch('http://localhost:5000/api/admin/modules', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!modulesRes.ok) {
        if (modulesRes.status === 401) {
          router.push('/login');
          return;
        }
        if (modulesRes.status === 403) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch modules');
      }

      const modulesData = await modulesRes.json();
      setModules(Array.isArray(modulesData) ? modulesData : []);

      // Fetch chapters for each module
      const allChapters: Chapter[] = [];

      for (const module of modulesData) {
        try {
          const chaptersRes = await fetch(`http://localhost:5000/api/admin/chapters/module/${module.id}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });

          if (chaptersRes.ok) {
            const moduleChapters = await chaptersRes.json();
            const chaptersWithModule = moduleChapters.map((chapter: any) => ({
              ...chapter,
              module: {
                id: module.id,
                title: module.title,
                course: module.course,
              },
            }));
            allChapters.push(...chaptersWithModule);
          }
        } catch (err) {
          console.warn(`Failed to fetch chapters for module ${module.id}:`, err);
        }
      }

      setChapters(allChapters);
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterChapters = () => {
    let filtered = chapters;

    if (searchTerm) {
      filtered = filtered.filter(
        (chapter) =>
          chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chapter.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chapter.module.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((chapter) => chapter.publishStatus === statusFilter);
    }

    if (moduleFilter !== 'ALL') {
      filtered = filtered.filter((chapter) => chapter.moduleId === moduleFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((chapter) => chapter.type === typeFilter);
    }

    setFilteredChapters(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setModuleFilter('ALL');
    setTypeFilter('ALL');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'ALL' || moduleFilter !== 'ALL' || typeFilter !== 'ALL';

  const handleCreateChapter = () => {
    setEditingChapter(null);
    setIsModalOpen(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setIsModalOpen(true);
  };

  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/chapters/${chapterId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete chapter');
      }

      await fetchData();
    } catch (err: unknown) {
      console.error('Error deleting chapter:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete chapter';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleToggleStatus = async (chapterId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const response = await fetch(`http://localhost:5000/api/admin/chapters/${chapterId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishStatus: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update chapter status');
      }

      await fetchData();
    } catch (err: unknown) {
      console.error('Error updating chapter status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update chapter status';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingChapter(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingChapter(null);
    fetchData();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading chapters...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-400 mb-4">⚠️ {error}</div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Calculate stats
  const totalChapters = chapters.length;
  const publishedChapters = chapters.filter((chapter) => chapter.publishStatus === 'PUBLISHED').length;
  const draftChapters = chapters.filter((chapter) => chapter.publishStatus === 'DRAFT').length;
  const videoChapters = chapters.filter((chapter) => chapter.type === 'VIDEO').length;
  const textChapters = chapters.filter((chapter) => chapter.type === 'TEXT').length;
  const pdfChapters = chapters.filter((chapter) => chapter.type === 'PDF').length;
  const quizChapters = chapters.filter((chapter) => chapter.type === 'QUIZ').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Chapters Management</h1>
            <p className="text-gray-400">Manage course chapters, content, and publication status</p>
          </div>

          <button
            onClick={handleCreateChapter}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Chapter
          </button>
        </div>

        {/* Stats */}
        <ChaptersStats
          totalChapters={totalChapters}
          publishedChapters={publishedChapters}
          draftChapters={draftChapters}
          videoChapters={videoChapters}
          textChapters={textChapters}
          pdfChapters={pdfChapters}
          quizChapters={quizChapters}
        />

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search chapters by title, description, or module..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[120px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT')}
              >
                <option value="ALL" className="bg-gray-900">All Status</option>
                <option value="PUBLISHED" className="bg-gray-900">Published</option>
                <option value="DRAFT" className="bg-gray-900">Draft</option>
              </select>
            </div>

            {/* Module Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[140px]"
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              >
                <option value="ALL" className="bg-gray-900">All Modules</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id} className="bg-gray-900">
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[120px]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ')}
              >
                <option value="ALL" className="bg-gray-900">All Types</option>
                <option value="VIDEO" className="bg-gray-900">Video</option>
                <option value="TEXT" className="bg-gray-900">Text</option>
                <option value="PDF" className="bg-gray-900">PDF</option>
                <option value="QUIZ" className="bg-gray-900">Quiz</option>
              </select>
            </div>
          </div>

          {/* Results Summary & Clear Filters */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Showing {filteredChapters.length} of {chapters.length} chapters
              {searchTerm && <span className="ml-2 text-blue-400">• Search: "{searchTerm}"</span>}
              {statusFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">• Status: {statusFilter}</span>
              )}
              {moduleFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Module: {modules.find((m) => m.id === moduleFilter)?.title}
                </span>
              )}
              {typeFilter !== 'ALL' && <span className="ml-2 text-blue-400">• Type: {typeFilter}</span>}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Chapters Table */}
        {filteredChapters.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              {hasActiveFilters ? (
                <>
                  <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
                  <p className="mb-4">No chapters match your current filters.</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <BookOpenIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No chapters yet</h3>
                  <p className="mb-4">Create your first chapter to get started.</p>
                  <button
                    onClick={handleCreateChapter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Chapter
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <ChaptersTable
            chapters={filteredChapters}
            onEditChapter={handleEditChapter}
            onDeleteChapter={handleDeleteChapter}
            onToggleStatus={handleToggleStatus}
            onRefresh={fetchData}
          />
        )}

        {/* Chapter Modal */}
        {isModalOpen && (
          <ChapterModal
            chapter={editingChapter}
            courses={courses}
            modules={modules}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
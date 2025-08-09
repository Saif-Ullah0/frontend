"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import NoteModal from '@/components/admin/NoteModal';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon
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
  isPublished: boolean;
  orderIndex: number;
  courseId: number;
  moduleId?: number;
  chapterId?: number; // Added chapter support
  createdAt: string;
  course: {
    title: string;
  };
  module?: {
    title: string;
  };
  chapter?: { // Added chapter support
    title: string;
  };
}

interface Course {
  id: number;
  title: string;
}

interface Module {
  id: number;
  title: string;
  courseId: number;
}

interface Chapter {
  id: number;
  title: string;
  moduleId: number;
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<number | 'ALL'>('ALL');
  const [moduleFilter, setModuleFilter] = useState<number | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PDF' | 'DOC' | 'TXT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([fetchNotes(), fetchCourses()]);
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, courseFilter, moduleFilter, typeFilter, statusFilter]);

  useEffect(() => {
    if (courseFilter !== 'ALL') {
      loadModules(courseFilter as number);
    } else {
      setModules([]);
      setModuleFilter('ALL');
    }
  }, [courseFilter]);

  useEffect(() => {
    if (moduleFilter !== 'ALL') {
      loadChapters(moduleFilter as number);
    } else {
      setChapters([]);
    }
  }, [moduleFilter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/notes/admin/all', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setNotes(data);
      
    } catch (err: unknown) {
      console.error('Error fetching notes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/courses', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const loadModules = async (courseId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const courseData = await response.json();
        setModules(courseData.modules || []);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      setModules([]);
    }
  };

  const loadChapters = async (moduleId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/modules/${moduleId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const moduleData = await response.json();
        setChapters(moduleData.chapters || []);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      setChapters([]);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.module?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.chapter?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (courseFilter !== 'ALL') {
      filtered = filtered.filter(note => note.courseId === courseFilter);
    }

    // Module filter
    if (moduleFilter !== 'ALL') {
      filtered = filtered.filter(note => note.moduleId === moduleFilter);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(note => 
        note.fileType?.toUpperCase() === typeFilter.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(note => 
        statusFilter === 'PUBLISHED' ? note.isPublished : !note.isPublished
      );
    }

    setFilteredNotes(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCourseFilter('ALL');
    setModuleFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  const hasActiveFilters = searchTerm || courseFilter !== 'ALL' || moduleFilter !== 'ALL' || typeFilter !== 'ALL' || statusFilter !== 'ALL';

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      await fetchNotes();
      
    } catch (err: unknown) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
      setTimeout(() => setError(null), 5000);
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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading notes...</span>
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
              onClick={fetchNotes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Notes & Documents</h1>
            <p className="text-gray-400">Manage course notes, PDFs, and learning materials</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Note/PDF
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Notes</p>
                <p className="text-2xl font-bold text-white">{notes.length}</p>
              </div>
              <DocumentIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Published</p>
                <p className="text-2xl font-bold text-white">{notes.filter(n => n.isPublished).length}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Draft</p>
                <p className="text-2xl font-bold text-white">{notes.filter(n => !n.isPublished).length}</p>
              </div>
              <PencilIcon className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Downloads</p>
                <p className="text-2xl font-bold text-white">
                  {notes.reduce((sum, note) => sum + note.downloadCount, 0)}
                </p>
              </div>
              <ArrowDownTrayIcon className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes by title, description, course, module, or chapter..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4">
              {/* Course Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[150px]"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                >
                  <option value="ALL" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id} style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Module Filter */}
              <div className="relative">
                <select
                  className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[150px]"
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                  disabled={courseFilter === 'ALL'}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                >
                  <option value="ALL" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>All Modules</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id} style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="relative">
                <DocumentIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[120px]"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'PDF' | 'DOC' | 'TXT')}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                >
                  <option value="ALL" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>All Types</option>
                  <option value="PDF" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>PDF</option>
                  <option value="DOC" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>DOC</option>
                  <option value="TXT" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>TXT</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[130px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT')}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                >
                  <option value="ALL" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>All Status</option>
                  <option value="PUBLISHED" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Published</option>
                  <option value="DRAFT" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary & Clear Filters */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Showing {filteredNotes.length} of {notes.length} notes
              {searchTerm && (
                <span className="ml-2 text-blue-400">
                  • Search: "{searchTerm}"
                </span>
              )}
              {courseFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Course: {courses.find(c => c.id === courseFilter)?.title}
                </span>
              )}
              {moduleFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Module: {modules.find(m => m.id === moduleFilter)?.title}
                </span>
              )}
              {typeFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Type: {typeFilter}
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Status: {statusFilter}
                </span>
              )}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Notes Table */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              {hasActiveFilters ? (
                <>
                  <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                  <p className="mb-4">No notes match your current filters.</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <DocumentIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
                  <p className="mb-4">Create your first note or upload a PDF to get started.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Note
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Note</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Course/Module/Chapter</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Downloads</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Created</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {getFileIcon(note.fileType)}
                          <div>
                            <div className="font-medium text-white">{note.title}</div>
                            {note.description && (
                              <div className="text-sm text-gray-400 line-clamp-2 max-w-xs">
                                {note.description}
                              </div>
                            )}
                            {note.fileName && (
                              <div className="text-xs text-gray-500 mt-1">
                                {note.fileName} ({formatFileSize(note.fileSize || '0')})
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-white">{note.course.title}</div>
                          {note.module && (
                            <div className="text-gray-400">📁 {note.module.title}</div>
                          )}
                          {note.chapter && (
                            <div className="text-gray-500">📄 {note.chapter.title}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          note.fileType === 'pdf' ? 'bg-red-500/20 text-red-400' :
                          note.fileType === 'doc' || note.fileType === 'docx' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {note.fileType?.toUpperCase() || 'TEXT'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          note.isPublished 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {note.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {note.downloadCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {note.fileUrl && note.fileType === 'pdf' && (
                            <a
                              href={`http://localhost:5000${note.fileUrl.replace('/download/', '/view/')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                              title="View PDF"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </a>
                          )}
                          {note.fileUrl && (
                            <a
                              href={`http://localhost:5000${note.fileUrl}`}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded transition-colors"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEditingNote(note);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {isModalOpen && (
          <NoteModal
            note={editingNote}
            courses={courses}
            onClose={() => {
              setIsModalOpen(false);
              setEditingNote(null);
            }}
            onSuccess={() => {
              setIsModalOpen(false);
              setEditingNote(null);
              fetchNotes();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
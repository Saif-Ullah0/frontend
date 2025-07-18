// frontend/src/app/admin/modules/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ModulesTable from '@/components/admin/ModulesTable';
import ModulesStats from '@/components/admin/ModulesStats';
import ModuleModal from '@/components/admin/ModuleModal';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  RectangleStackIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Module {
  id: number;
  title: string;
  slug: string;
  description: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  course: {
    id: number;
    title: string;
    category: {
      name: string;
    };
  };
  _count?: {
    lessons: number;
  };
}

interface Course {
  id: number;
  title: string;
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [courseFilter, setCourseFilter] = useState<number | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([fetchModules(), fetchCourses()]);
  }, []);

  useEffect(() => {
    filterModules();
  }, [modules, searchTerm, statusFilter, courseFilter]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/modules', {
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
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setModules(data);
      
    } catch (err: unknown) {
      console.error('Error fetching modules:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch modules';
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

  const filterModules = () => {
    let filtered = modules;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(module => 
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(module => 
        statusFilter === 'PUBLISHED' ? module.isPublished : !module.isPublished
      );
    }

    // Course filter
    if (courseFilter !== 'ALL') {
      filtered = filtered.filter(module => module.course.id === courseFilter);
    }

    setFilteredModules(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCourseFilter('ALL');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'ALL' || courseFilter !== 'ALL';

  const handleCreateModule = () => {
    setEditingModule(null);
    setIsModalOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setIsModalOpen(true);
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete module: ${response.statusText}`);
      }

      // Refresh modules list
      await fetchModules();
      
    } catch (err: unknown) {
      console.error('Error deleting module:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete module';
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingModule(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingModule(null);
    fetchModules();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading modules...</span>
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
              onClick={fetchModules}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const publishedCount = modules.filter(module => module.isPublished).length;
  const draftCount = modules.filter(module => !module.isPublished).length;
  const totalLessons = modules.reduce((sum, module) => sum + (module._count?.lessons || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Modules Management</h1>
            <p className="text-gray-400">Manage course modules and organize learning content</p>
          </div>
          
          <button 
            onClick={handleCreateModule}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Module
          </button>
        </div>

        {/* Stats */}
        <ModulesStats
          totalModules={modules.length}
          publishedModules={publishedCount}
          draftModules={draftCount}
          totalLessons={totalLessons}
        />

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules by title, description, or course..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[130px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT')}
              >
                <option value="ALL" className="bg-gray-900">All Status</option>
                <option value="PUBLISHED" className="bg-gray-900">Published</option>
                <option value="DRAFT" className="bg-gray-900">Draft</option>
              </select>
            </div>

            {/* Course Filter */}
            <div className="relative">
              <RectangleStackIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[150px]"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
              >
                <option value="ALL" className="bg-gray-900">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id} className="bg-gray-900">
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary & Clear Filters */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Showing {filteredModules.length} of {modules.length} modules
              {searchTerm && (
                <span className="ml-2 text-blue-400">
                  • Search: &quot;{searchTerm}&quot;
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Status: {statusFilter}
                </span>
              )}
              {courseFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Course: {courses.find(c => c.id === courseFilter)?.title}
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

        {/* Modules Table */}
        {filteredModules.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              {hasActiveFilters ? (
                <>
                  <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No modules found</h3>
                  <p className="mb-4">No modules match your current filters.</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <RectangleStackIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
                  <p className="mb-4">Create your first module to organize course content.</p>
                  <button
                    onClick={handleCreateModule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Module
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <ModulesTable
            modules={filteredModules}
            onEditModule={handleEditModule}
            onDeleteModule={handleDeleteModule}
            onRefresh={fetchModules}
          />
        )}

        {/* Module Modal */}
        {isModalOpen && (
          <ModuleModal
            module={editingModule}
            courses={courses}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
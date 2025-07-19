// frontend/src/app/admin/courses/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import CoursesTable from '@/components/admin/CoursesTable';
import CoursesStats from '@/components/admin/CoursesStats';
import CourseModal from '@/components/admin/CourseModal';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  CurrencyDollarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  isDeleted: boolean;
  createdAt: string;
  category: {
    id: number;
    name: string;
  };
  _count?: {
    modules: number;
    enrollments: number;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'ALL'>('ALL');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([fetchCourses(), fetchCategories()]);
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, categoryFilter, priceFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/courses', {
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
      setCourses(data);
      
    } catch (err: unknown) {
      console.error('Error fetching courses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const filterCourses = () => {
    let filtered = courses.filter(course => !course.isDeleted);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(course => course.category.id === categoryFilter);
    }

    // Price filter
    if (priceFilter !== 'ALL') {
      filtered = filtered.filter(course => 
        priceFilter === 'FREE' ? course.price === 0 : course.price > 0
      );
    }

    setFilteredCourses(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('ALL');
    setPriceFilter('ALL');
  };

  const hasActiveFilters = searchTerm || categoryFilter !== 'ALL' || priceFilter !== 'ALL';

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete course: ${response.statusText}`);
      }

      // Refresh courses list
      await fetchCourses();
      
    } catch (err: unknown) {
      console.error('Error deleting course:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    fetchCourses();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading courses...</span>
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
              onClick={fetchCourses}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const activeCourses = courses.filter(course => !course.isDeleted);
  const freeCourses = activeCourses.filter(course => course.price === 0).length;
  const paidCourses = activeCourses.filter(course => course.price > 0).length;
  const totalEnrollments = activeCourses.reduce((sum, course) => sum + (course._count?.enrollments || 0), 0);
  const totalRevenue = activeCourses.reduce((sum, course) => sum + (course.price * (course._count?.enrollments || 0)), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Courses Management</h1>
            <p className="text-gray-400">Manage your platform's courses and educational content</p>
          </div>
          
          <button 
            onClick={handleCreateCourse}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Course
          </button>
        </div>

        {/* Stats */}
        <CoursesStats
          totalCourses={activeCourses.length}
          freeCourses={freeCourses}
          paidCourses={paidCourses}
          totalEnrollments={totalEnrollments}
          totalRevenue={totalRevenue}
        />

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title, description, or category..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[150px]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
              >
                <option value="ALL">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="bg-gray-900">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[130px]"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as 'ALL' | 'FREE' | 'PAID')}
              >
                <option value="ALL" className="bg-gray-900">All Prices</option>
                <option value="FREE" className="bg-gray-900">Free Courses</option>
                <option value="PAID" className="bg-gray-900">Paid Courses</option>
              </select>
            </div>
          </div>

          {/* Results Summary & Clear Filters */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Showing {filteredCourses.length} of {activeCourses.length} courses
              {searchTerm && (
                <span className="ml-2 text-blue-400">
                  • Search: "{searchTerm}"
                </span>
              )}
              {categoryFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Category: {categories.find(c => c.id === categoryFilter)?.name}
                </span>
              )}
              {priceFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Price: {priceFilter}
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

        {/* Courses Table */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              {hasActiveFilters ? (
                <>
                  <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="mb-4">No courses match your current filters.</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="mb-4">Create your first course to start building your platform.</p>
                  <button
                    onClick={handleCreateCourse}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Course
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <CoursesTable
            courses={filteredCourses}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onRefresh={fetchCourses}
          />
        )}

        {/* Course Modal */}
        {isModalOpen && (
          <CourseModal
            course={editingCourse}
            categories={categories}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
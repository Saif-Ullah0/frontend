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
  AcademicCapIcon,
  CurrencyDollarIcon
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
    console.log('🔍 Courses: Fetching all courses...');
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/courses', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 Courses: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Courses: 401 Unauthorized - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          console.log('❌ Courses: 403 Forbidden - redirecting to home');
          router.push('/');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Courses: Courses data received:', data);
      
      setCourses(data);
      
    } catch (err: unknown) {
      console.error('❌ Courses: Error fetching courses:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      console.log('🔍 Courses: Setting loading to false');
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
    let filtered = courses.filter(course => !course.isDeleted); // Only show non-deleted courses

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

    console.log('🔍 Courses: Deleting course:', courseId);
    
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

      console.log('✅ Courses: Course deleted successfully');
      
      // Refresh courses list
      await fetchCourses();
      
    } catch (err: unknown) {
      console.error('❌ Courses: Error deleting course:', err);
      
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
    fetchCourses(); // Refresh the list
  };

  if (loading) {
    console.log('🔍 Courses: Rendering loading state...');
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    console.log('🔍 Courses: Rendering error state:', error);
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={fetchCourses}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  console.log('🔍 Courses: Rendering courses page with data:', {
    totalCourses: courses.length,
    filteredCourses: filteredCourses.length,
    searchTerm,
    categoryFilter,
    priceFilter
  });

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
            <p className="text-gray-400">Manage your platform's courses and content</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCreateCourse}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Course
            </button>
          </div>
        </div>

        {/* Stats Cards */}
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
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
              >
                <option value="ALL">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as 'ALL' | 'FREE' | 'PAID')}
              >
                <option value="ALL">All Prices</option>
                <option value="FREE">Free Courses</option>
                <option value="PAID">Paid Courses</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredCourses.length} of {activeCourses.length} courses
            {searchTerm && (
              <span className="ml-2">
                • Search: "{searchTerm}"
              </span>
            )}
            {categoryFilter !== 'ALL' && (
              <span className="ml-2">
                • Category: {categories.find(c => c.id === categoryFilter)?.name}
              </span>
            )}
            {priceFilter !== 'ALL' && (
              <span className="ml-2">
                • Price: {priceFilter}
              </span>
            )}
          </div>
        </div>

        {/* Courses Table */}
        <CoursesTable
          courses={filteredCourses}
          onEditCourse={handleEditCourse}
          onDeleteCourse={handleDeleteCourse}
          onRefresh={fetchCourses}
        />

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
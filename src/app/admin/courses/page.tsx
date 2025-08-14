//frontend/src/app/admin/courses/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  AcademicCapIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TagIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  GlobeAltIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  isPaid: boolean;
  imageUrl?: string;
  publishStatus: 'DRAFT' | 'PUBLISHED';
  isDeleted: boolean;
  category: {
    id: number;
    name: string;
  };
  _count: {
    enrollments: number;
    modules: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CourseFormData {
  title: string;
  description: string;
  categoryId: string;
  imageUrl: string;
  isFree: boolean;
  price: number;
  publishStatus: 'DRAFT' | 'PUBLISHED';
}

type ActiveTab = 'courses' | 'create-course' | 'analytics';
type FilterStatus = 'all' | 'published' | 'draft' | 'paid' | 'free';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('courses');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Course form state
  const [courseForm, setCourseForm] = useState<CourseFormData>({
    title: '',
    description: '',
    categoryId: '',
    imageUrl: '',
    isFree: true,
    price: 0,
    publishStatus: 'DRAFT'
  });

  // 🆕 Edit modal state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState<CourseFormData>({
    title: '',
    description: '',
    categoryId: '',
    imageUrl: '',
    isFree: true,
    price: 0,
    publishStatus: 'DRAFT'
  });
  const [updating, setUpdating] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      
      // 🔧 FIX: Try admin endpoint first, then fall back to regular endpoint
      let response = await fetch('http://localhost:5000/api/admin/courses', {
        credentials: 'include'
      });

      // If admin endpoint doesn't exist, try regular endpoint
      if (!response.ok && response.status === 404) {
        console.log('🔄 Admin endpoint not found, trying regular endpoint...');
        response = await fetch('http://localhost:5000/api/courses', {
          credentials: 'include'
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📚 Courses fetched:', data);
        
        // Handle both possible response formats
        const coursesArray = data.courses || data || [];
        setCourses(Array.isArray(coursesArray) ? coursesArray : []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to load courses:', response.status, errorData);
        toast.error(`Failed to load courses: ${errorData.error || 'Server error'}`);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(`Failed to load courses: ${error.message}`);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterStatus, searchTerm]);

  const fetchCategories = useCallback(async () => {
    try {
      console.log('🔍 Fetching categories...');
      const response = await fetch('http://localhost:5000/api/categories', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📁 Categories fetched:', data);
        
        // Handle both possible response formats
        const categoriesArray = data.categories || data || [];
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
        
        if (categoriesArray.length === 0) {
          console.warn('⚠️ No categories found');
          toast.warning('No categories available. Please create categories first.');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to load categories:', response.status, errorData);
        toast.error(`Failed to load categories: ${errorData.error || 'Server error'}`);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      toast.error(`Failed to load categories: ${error.message}`);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFormChange = (field: keyof CourseFormData, value: any) => {
    setCourseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🆕 Edit form handlers
  const handleEditFormChange = (field: keyof CourseFormData, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartEdit = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      categoryId: course.category?.id?.toString() || '',
      imageUrl: course.imageUrl || '',
      isFree: !course.isPaid,
      price: course.price || 0,
      publishStatus: course.publishStatus || 'DRAFT'
    });
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setEditForm({
      title: '',
      description: '',
      categoryId: '',
      imageUrl: '',
      isFree: true,
      price: 0,
      publishStatus: 'DRAFT'
    });
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    // Validation
    if (!editForm.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    if (!editForm.description.trim()) {
      toast.error('Course description is required');
      return;
    }

    if (!editForm.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!editForm.isFree && editForm.price <= 0) {
      toast.error('Price must be greater than 0 for paid courses');
      return;
    }

    setUpdating(true);

    try {
      const updateData = {
        title: editForm.title,
        description: editForm.description,
        categoryId: parseInt(editForm.categoryId),
        imageUrl: editForm.imageUrl || null,
        isPaid: !editForm.isFree,
        price: editForm.isFree ? 0 : editForm.price,
        publishStatus: editForm.publishStatus
      };

      console.log('🔄 Updating course with data:', updateData);

      // Try admin endpoint first
      let response = await fetch(`http://localhost:5000/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      // If admin endpoint doesn't exist, try regular endpoint
      if (!response.ok && response.status === 404) {
        console.log('🔄 Admin update endpoint not found, trying regular endpoint...');
        response = await fetch(`http://localhost:5000/api/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
          credentials: 'include'
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Course updated successfully:', data);
        toast.success('Course updated successfully!');
        
        // Close edit modal and refresh
        handleCancelEdit();
        fetchCourses();
      } else {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}`,
          message: 'Course update failed'
        }));
        
        console.error('❌ Course update failed:', response.status, errorData);
        toast.error(`❌ ${errorData.error || errorData.message || 'Failed to update course'}`);
      }
    } catch (error) {
      console.error('❌ Error updating course:', error);
      toast.error(`❌ Network error: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateCourse = async () => {
    // Validation
    if (!courseForm.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    if (!courseForm.description.trim()) {
      toast.error('Course description is required');
      return;
    }

    if (!courseForm.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!courseForm.isFree && courseForm.price <= 0) {
      toast.error('Price must be greater than 0 for paid courses');
      return;
    }

    setCreating(true);

    try {
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        categoryId: parseInt(courseForm.categoryId),
        imageUrl: courseForm.imageUrl || null,
        isPaid: !courseForm.isFree,
        price: courseForm.isFree ? 0 : courseForm.price,
        publishStatus: courseForm.publishStatus
      };

      console.log('🔍 Creating course with data:', courseData);

      // 🔧 FIX: Use admin endpoint (should work with the backend fix provided)
      const response = await fetch('http://localhost:5000/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Course created successfully:', data);
        toast.success(`Course ${courseForm.publishStatus === 'PUBLISHED' ? 'created and published' : 'saved as draft'} successfully!`);
        
        // Reset form
        setCourseForm({
          title: '',
          description: '',
          categoryId: '',
          imageUrl: '',
          isFree: true,
          price: 0,
          publishStatus: 'DRAFT'
        });

        // Refresh courses and go to courses tab
        fetchCourses();
        setActiveTab('courses');
      } else {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}`,
          message: 'Course creation failed'
        }));
        
        console.error('❌ Course creation failed:', response.status, errorData);
        
        // Show specific error messages
        if (response.status === 404) {
          toast.error('❌ Admin course endpoint not found. Please add the backend route.');
        } else if (response.status === 403) {
          toast.error('❌ Permission denied. Admin access required.');
        } else if (response.status === 400) {
          toast.error(`❌ ${errorData.error || 'Invalid course data'}`);
        } else {
          toast.error(`❌ ${errorData.error || errorData.message || 'Failed to create course'}`);
        }
      }
    } catch (error) {
      console.error('❌ Error creating course:', error);
      toast.error(`❌ Network error: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (courseId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    
    try {
      console.log(`🔄 Toggling course ${courseId} from ${currentStatus} to ${newStatus}`);
      
      // 🔧 FIX: Try admin endpoint first, fall back to regular endpoint
      let response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishStatus: newStatus }),
        credentials: 'include'
      });

      // If admin endpoint doesn't exist, try regular endpoint
      if (!response.ok && response.status === 404) {
        console.log('🔄 Admin endpoint not found, trying regular endpoint...');
        response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publishStatus: newStatus }),
          credentials: 'include'
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Status updated:', data);
        toast.success(`Course ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'} successfully`);
        fetchCourses();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Status update failed:', response.status, errorData);
        toast.error(errorData.error || errorData.message || 'Failed to update course status');
      }
    } catch (error) {
      console.error('❌ Error toggling status:', error);
      toast.error(`Something went wrong: ${error.message}`);
    }
  };

  const handleDeleteCourse = async (courseId: number, courseName: string) => {
    if (!confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`🗑️ Deleting course ${courseId}: ${courseName}`);
      
      // 🔧 FIX: Try admin endpoint first, fall back to regular endpoint
      let response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      // If admin endpoint doesn't exist, try regular endpoint
      if (!response.ok && response.status === 404) {
        console.log('🔄 Admin delete endpoint not found, trying regular endpoint...');
        response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Course deleted:', data);
        toast.success('Course deleted successfully');
        fetchCourses();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Delete failed:', response.status, errorData);
        toast.error(errorData.error || errorData.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      toast.error(`Something went wrong: ${error.message}`);
    }
  };

  const filteredCourses = courses.filter(course => {
    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = course.title?.toLowerCase().includes(search) ||
                           course.description?.toLowerCase().includes(search) ||
                           course.category?.name?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Apply status filter - handle missing fields gracefully
    switch (filterStatus) {
      case 'published':
        return course.publishStatus === 'PUBLISHED';
      case 'draft':
        return course.publishStatus === 'DRAFT' || !course.publishStatus;
      case 'paid':
        return course.isPaid === true;
      case 'free':
        return course.isPaid === false || course.isPaid === undefined;
      default:
        return true;
    }
  });

  if (loading && activeTab === 'courses') {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading courses...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Course Management</h1>
            <p className="text-gray-400 text-lg">Create and manage courses across the platform</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                fetchCourses();
                fetchCategories();
                toast.info('Refreshing data...');
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              Refresh
            </button>
            
            <button
              onClick={() => setActiveTab('create-course')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Course
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'courses'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <AcademicCapIcon className="w-4 h-4" />
            All Courses ({courses.length})
          </button>
          
          <button
            onClick={() => setActiveTab('create-course')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'create-course'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            Create Course
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ChartBarIcon className="w-4 h-4" />
            Analytics
          </button>
        </div>

        {/* Content */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="paid">Paid Courses</option>
                    <option value="free">Free Courses</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="enrollments">Most Enrolled</option>
                    <option value="price">Highest Price</option>
                  </select>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{courses.length}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{courses.filter(c => c.publishStatus === 'PUBLISHED').length}</p>
                  <p className="text-xs text-gray-400">Published</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{courses.filter(c => c.publishStatus === 'DRAFT').length}</p>
                  <p className="text-xs text-gray-400">Drafts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{courses.filter(c => !c.isPaid).length}</p>
                  <p className="text-xs text-gray-400">Free</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{courses.filter(c => c.isPaid).length}</p>
                  <p className="text-xs text-gray-400">Paid</p>
                </div>
              </div>
              
              {/* Debug Info */}
              <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-gray-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Debug Info:</strong><br/>
                    • Total courses: {courses.length}<br/>
                    • Filtered courses: {filteredCourses.length}<br/>
                    • Categories loaded: {categories.length}
                  </div>
                  <div>
                    <strong>Sample course fields:</strong><br/>
                    {courses.length > 0 && (
                      <>
                        • Has publishStatus: {courses[0].publishStatus ? '✅' : '❌'}<br/>
                        • Has isPaid: {courses[0].isPaid !== undefined ? '✅' : '❌'}<br/>
                        • Has category: {courses[0].category ? '✅' : '❌'}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
                  <AcademicCapIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {courses.length === 0 ? 'No Courses Yet' : 'No Courses Match Filters'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {courses.length === 0 
                      ? 'Create your first course to get started'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                  <button
                    onClick={() => setActiveTab('create-course')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Create First Course
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                  >
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            course.publishStatus === 'PUBLISHED' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {course.publishStatus || 'DRAFT'}
                          </span>

                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            course.isPaid 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {course.isPaid ? 'Paid' : 'Free'}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">{course.description}</p>
                        
                        {course.category && (
                          <div className="flex items-center gap-2 text-sm text-purple-400 mb-2">
                            <TagIcon className="w-4 h-4" />
                            <span>{course.category.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/5 rounded-2xl">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{course._count?.modules || 0}</p>
                        <p className="text-xs text-gray-400">Modules</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-400">{course._count?.enrollments || 0}</p>
                        <p className="text-xs text-gray-400">Students</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-400">
                          {course.isPaid ? `${course.price || 0}` : 'Free'}
                        </p>
                        <p className="text-xs text-gray-400">Price</p>
                      </div>
                    </div>

                    {/* Course Image */}
                    {course.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </Link>
                        
                        <button
                          onClick={() => handleStartEdit(course)}
                          className="py-2 text-center bg-blue-600/20 border border-blue-600/30 hover:bg-blue-600/30 text-blue-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <PencilIcon className="w-4 h-4" />
                          Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleToggleStatus(course.id, course.publishStatus || 'DRAFT')}
                          className={`py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                            (course.publishStatus || 'DRAFT') === 'PUBLISHED'
                              ? 'bg-yellow-600/20 border border-yellow-600/30 hover:bg-yellow-600/30 text-yellow-400'
                              : 'bg-green-600/20 border border-green-600/30 hover:bg-green-600/30 text-green-400'
                          }`}
                        >
                          {(course.publishStatus || 'DRAFT') === 'PUBLISHED' ? (
                            <>
                              <XCircleIcon className="w-4 h-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-4 h-4" />
                              Publish
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          className="py-2 bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create-course' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Create New Course</h2>
              <p className="text-gray-400">Build your course step by step</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Course Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6" />
                    Course Information
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Course Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        value={courseForm.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        placeholder="e.g., Complete React Development Course"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Course Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Description *
                      </label>
                      <textarea
                        value={courseForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Describe what students will learn in this course..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category * {categories.length === 0 && <span className="text-red-400">(No categories available)</span>}
                      </label>
                      <select
                        value={courseForm.categoryId}
                        onChange={(e) => handleFormChange('categoryId', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">
                          {categories.length === 0 ? 'No categories available' : 'Select a category'}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>No categories found. Please create categories first.</span>
                          </div>
                          <Link 
                            href="/admin/categories" 
                            className="inline-block mt-2 text-red-300 hover:text-red-200 underline text-sm"
                          >
                            Go to Category Management
                          </Link>
                        </div>
                      )}
                      
                      {/* Debug info */}
                      <div className="mt-2 text-xs text-gray-500">
                        Debug: {categories.length} categories loaded
                      </div>
                    </div>

                    {/* Course Image URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Image URL (Optional)
                      </label>
                      <div className="relative">
                        <PhotoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="url"
                          value={courseForm.imageUrl}
                          onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                          placeholder="https://example.com/course-image.jpg"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Publishing */}
              <div className="lg:col-span-1 space-y-6">
                {/* Pricing */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-6 h-6" />
                    Pricing
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Free/Paid Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Course Type
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="courseType"
                            checked={courseForm.isFree}
                            onChange={() => handleFormChange('isFree', true)}
                            className="w-4 h-4 text-blue-600 bg-white/5 border-white/20"
                          />
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            <span className="text-white">Free Course</span>
                          </div>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="courseType"
                            checked={!courseForm.isFree}
                            onChange={() => handleFormChange('isFree', false)}
                            className="w-4 h-4 text-blue-600 bg-white/5 border-white/20"
                          />
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />
                            <span className="text-white">Paid Course</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Price Input */}
                    {!courseForm.isFree && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Course Price ($) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={courseForm.price}
                          onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                          placeholder="29.99"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {/* Pricing Info */}
                    <div className={`p-3 rounded-xl ${
                      courseForm.isFree 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <InformationCircleIcon className={`w-4 h-4 ${
                          courseForm.isFree ? 'text-green-400' : 'text-yellow-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          courseForm.isFree ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {courseForm.isFree ? 'Free Course' : 'Paid Course'}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        courseForm.isFree ? 'text-green-300' : 'text-yellow-300'
                      }`}>
                        {courseForm.isFree 
                          ? 'Students can enroll for free'
                          : `Students will pay $${courseForm.price} to access this course`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Publishing */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <GlobeAltIcon className="w-6 h-6" />
                    Publishing
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Publish Status
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="publishStatus"
                            value="DRAFT"
                            checked={courseForm.publishStatus === 'DRAFT'}
                            onChange={() => handleFormChange('publishStatus', 'DRAFT')}
                            className="w-4 h-4 text-blue-600 bg-white/5 border-white/20"
                          />
                          <div>
                            <span className="text-white font-medium">Save as Draft</span>
                            <p className="text-xs text-gray-400">Course will be saved but not visible to students</p>
                          </div>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="publishStatus"
                            value="PUBLISHED"
                            checked={courseForm.publishStatus === 'PUBLISHED'}
                            onChange={() => handleFormChange('publishStatus', 'PUBLISHED')}
                            className="w-4 h-4 text-blue-600 bg-white/5 border-white/20"
                          />
                          <div>
                            <span className="text-white font-medium">Publish Now</span>
                            <p className="text-xs text-gray-400">Course will be visible to all students</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Status Info */}
                    <div className={`p-3 rounded-xl ${
                      courseForm.publishStatus === 'PUBLISHED'
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'bg-gray-500/10 border border-gray-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          courseForm.publishStatus === 'PUBLISHED' ? 'bg-blue-400' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          courseForm.publishStatus === 'PUBLISHED' ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          {courseForm.publishStatus === 'PUBLISHED' ? 'Will be Published' : 'Will be Saved as Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateCourse}
                  disabled={creating || !courseForm.title.trim() || !courseForm.description.trim() || !courseForm.categoryId}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {creating ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <AcademicCapIcon className="w-6 h-6" />
                      {courseForm.publishStatus === 'PUBLISHED' ? 'Create & Publish' : 'Save as Draft'}
                    </>
                  )}
                </button>

                {/* Backend Setup Help */}
                <div className="text-center text-sm text-gray-400 p-3 bg-white/5 rounded-lg">
                  <p><strong>📝 Note:</strong> You can add modules and content after creating the course</p>
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                      🔧 Having issues? Click for backend setup help
                    </summary>
                    <div className="mt-2 text-xs text-left space-y-2">
                      <p><strong>If course creation fails:</strong></p>
                      <p>1. Ensure <code>/api/admin/courses</code> POST endpoint exists</p>
                      <p>2. Check server logs for authentication issues</p>
                      <p>3. Verify admin middleware is working</p>
                      <p>4. See the backend fix code provided above</p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-center">
              <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">Course Analytics Coming Soon</h3>
              <p className="text-gray-400">Detailed analytics and insights will be available here</p>
            </div>
          </div>
        )}
      </div>

      {/* 🆕 Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0b14] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Edit Course</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XCircleIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Course Details */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-4">
                    {/* Course Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => handleEditFormChange('title', e.target.value)}
                        placeholder="e.g., Complete React Development Course"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Course Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Description *
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                        placeholder="Describe what students will learn in this course..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={editForm.categoryId}
                        onChange={(e) => handleEditFormChange('categoryId', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Course Image URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Course Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={editForm.imageUrl}
                        onChange={(e) => handleEditFormChange('imageUrl', e.target.value)}
                        placeholder="https://example.com/course-image.jpg"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Pricing & Publishing */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Pricing */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Pricing</h3>
                    
                    <div className="space-y-4">
                      {/* Free/Paid Toggle */}
                      <div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="editCourseType"
                              checked={editForm.isFree}
                              onChange={() => handleEditFormChange('isFree', true)}
                              className="w-4 h-4 text-blue-600 bg-white/5 border-white/20"
                            />
                            <span className="text-white">Free Course</span>
                          </label>
                          
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="editCourseType"
                              checked={!editForm.isFree}
                              onChange={() => handleEditFormChange('isFree', false)}
                              className="w-4 h-4 text-blue-600 bg-white/5 border-white/20"
                            />
                            <span className="text-white">Paid Course</span>
                          </label>
                        </div>
                      </div>

                      {/* Price Input */}
                      {!editForm.isFree && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Course Price ($) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => handleEditFormChange('price', parseFloat(e.target.value) || 0)}
                            placeholder="29.99"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Publishing */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Publishing</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="editPublishStatus"
                          value="DRAFT"
                          checked={editForm.publishStatus === 'DRAFT'}
                          onChange={() => handleEditFormChange('publishStatus', 'DRAFT')}
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/20"
                        />
                        <span className="text-white">Draft</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="editPublishStatus"
                          value="PUBLISHED"
                          checked={editForm.publishStatus === 'PUBLISHED'}
                          onChange={() => handleEditFormChange('publishStatus', 'PUBLISHED')}
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/20"
                        />
                        <span className="text-white">Published</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleUpdateCourse}
                  disabled={updating || !editForm.title.trim() || !editForm.description.trim() || !editForm.categoryId}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Update Course
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
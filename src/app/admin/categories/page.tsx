// frontend/src/app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoriesTable from '@/components/admin/CategoriesTable';
import CategoriesStats from '@/components/admin/CategoriesStats';
import CategoryModal from '@/components/admin/CategoryModal';
import { MagnifyingGlassIcon, PlusIcon, FolderIcon } from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  _count?: {
    courses: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    console.log('🔍 Categories: Fetching all categories...');
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 Categories: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Categories: 401 Unauthorized - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          console.log('❌ Categories: 403 Forbidden - redirecting to home');
          router.push('/');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Categories: Categories data received:', data);
      
      setCategories(data);
      
    } catch (err: unknown) {
      console.error('❌ Categories: Error fetching categories:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      console.log('🔍 Categories: Setting loading to false');
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    console.log('🔍 Categories: Deleting category:', categoryId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete category: ${response.statusText}`);
      }

      console.log('✅ Categories: Category deleted successfully');
      
      // Refresh categories list
      await fetchCategories();
      
    } catch (err: unknown) {
      console.error('❌ Categories: Error deleting category:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    fetchCategories(); // Refresh the list
  };

  if (loading) {
    console.log('🔍 Categories: Rendering loading state...');
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    console.log('🔍 Categories: Rendering error state:', error);
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  console.log('🔍 Categories: Rendering categories page with data:', {
    totalCategories: categories.length,
    filteredCategories: filteredCategories.length,
    searchTerm
  });

  const totalCourses = categories.reduce((sum, cat) => sum + (cat._count?.courses || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Categories Management</h1>
            <p className="text-gray-400">Organize courses into categories</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCreateCategory}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <CategoriesStats
          totalCategories={categories.length}
          totalCourses={totalCourses}
          avgCoursesPerCategory={categories.length > 0 ? Math.round(totalCourses / categories.length) : 0}
        />

        {/* Search */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Results Info */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredCategories.length} of {categories.length} categories
            {searchTerm && (
              <span className="ml-2">
                • Search: "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Categories Table */}
        <CategoriesTable
          categories={filteredCategories}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onRefresh={fetchCategories}
        />

        {/* Category Modal */}
        {isModalOpen && (
          <CategoryModal
            category={editingCategory}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
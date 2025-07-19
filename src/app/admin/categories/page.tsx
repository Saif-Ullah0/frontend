// frontend/src/app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoriesTable from '@/components/admin/CategoriesTable';
import CategoriesStats from '@/components/admin/CategoriesStats';
import CategoryModal from '@/components/admin/CategoryModal';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

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
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/categories', {
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
      setCategories(data);
      
    } catch (err: unknown) {
      console.error('Error fetching categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
    } finally {
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
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
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

      // Refresh categories list
      await fetchCategories();
      
    } catch (err: unknown) {
      console.error('Error deleting category:', err);
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
    fetchCategories();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading categories...</span>
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
              onClick={fetchCategories}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalCourses = categories.reduce((sum, cat) => sum + (cat._count?.courses || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Categories Management</h1>
            <p className="text-gray-400">Organize courses into categories and manage course structure</p>
          </div>
          
          <button 
            onClick={handleCreateCategory}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>

        {/* Stats */}
        <CategoriesStats
          totalCategories={categories.length}
          totalCourses={totalCourses}
          avgCoursesPerCategory={categories.length > 0 ? Math.round(totalCourses / categories.length) : 0}
        />

        {/* Search & Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>
              Showing {filteredCategories.length} of {categories.length} categories
              {searchTerm && (
                <span className="ml-2 text-blue-400">
                  • Filtered by: &quot;{searchTerm}&quot;
                </span>
              )}
            </span>
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Categories Table */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              {searchTerm ? (
                <>
                  <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                  <p>No categories match your search criteria.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                  <p className="mb-4">Create your first category to organize courses.</p>
                  <button
                    onClick={handleCreateCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Category
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <CategoriesTable
            categories={filteredCategories}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onRefresh={fetchCategories}
          />
        )}

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
// frontend/src/components/admin/CategoriesTable.tsx
"use client";

import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  FolderIcon,
  PhotoIcon,
  CalendarIcon,
  AcademicCapIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

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

interface CategoriesTableProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function CategoriesTable({ 
  categories, 
  onEditCategory, 
  onDeleteCategory, 
  onRefresh 
}: CategoriesTableProps) {
  const [deletingCategories, setDeletingCategories] = useState<Set<number>>(new Set());

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

  const handleDeleteCategory = async (categoryId: number) => {
    setDeletingCategories(prev => new Set(prev).add(categoryId));
    
    try {
      await onDeleteCategory(categoryId);
    } finally {
      setDeletingCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
        <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No categories found</h3>
        <p className="text-gray-400 mb-4">Start by creating your first category to organize courses.</p>
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
        <h3 className="text-lg font-semibold text-white">Categories ({categories.length})</h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Courses
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
            {categories.map((category) => (
              <tr 
                key={category.id} 
                className="hover:bg-white/5 transition-colors duration-200"
              >
                {/* Category Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {category.imageUrl ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Replace with fallback icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg hidden items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        /{category.slug}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Description */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300 max-w-xs truncate">
                    {category.description}
                  </div>
                </td>

                {/* Courses Count */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      {category._count?.courses || 0} courses
                    </span>
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(category.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEditCategory(category)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={deletingCategories.has(category.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingCategories.has(category.id) ? (
                        <>
                          <div className="animate-spin h-3 w-3 mr-1 border border-white border-t-transparent rounded-full"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <TrashIcon className="h-3 w-3 mr-1" />
                          Delete
                        </>
                      )}
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
            Total: {categories.length} categories
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
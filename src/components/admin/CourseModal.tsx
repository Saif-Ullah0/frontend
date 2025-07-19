// frontend/src/components/admin/CourseModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

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
}

interface Category {
  id: number;
  name: string;
}

interface CourseModalProps {
  course: Course | null; // null for create, course object for edit
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  categoryId: number | '';
  imageUrl: string;
}

export default function CourseModal({ course, categories, onClose, onSuccess }: CourseModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    categoryId: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(course);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        categoryId: course.category.id,
        imageUrl: course.imageUrl
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        categoryId: categories.length > 0 ? categories[0].id : '',
        imageUrl: ''
      });
    }
  }, [course, categories]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('🔍 CourseModal: Submitting form data:', formData);

    try {
      if (!formData.categoryId) {
        throw new Error('Please select a category');
      }

      const slug = generateSlug(formData.title);
      const requestData = {
        ...formData,
        slug,
        categoryId: parseInt(formData.categoryId.toString()),
        price: parseFloat(formData.price.toString())
      };

      const url = isEditing 
        ? `http://localhost:5000/api/admin/courses/${course!.id}`
        : 'http://localhost:5000/api/admin/courses';
      
      const method = isEditing ? 'PUT' : 'POST';

      console.log(`🔍 CourseModal: Making ${method} request to:`, url);

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('🔍 CourseModal: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ CourseModal: Course saved successfully:', result);

      onSuccess();
      
    } catch (err: unknown) {
      console.error('❌ CourseModal: Error saving course:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to save course';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'categoryId') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-800 backdrop-blur-lg border border-white/20 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Course Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter course title"
              value={formData.title}
              onChange={handleInputChange}
            />
            {formData.title && (
              <p className="text-xs text-gray-400 mt-1">
                Slug: /{generateSlug(formData.title)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe this course"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.categoryId}
              onChange={handleInputChange}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
              Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              value={formData.price}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-400 mt-1">
              Set to 0 for free courses
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Course Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/course-image.jpg"
              value={formData.imageUrl}
              onChange={handleInputChange}
            />
          </div>

          {/* Image Preview */}
          {formData.imageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
              <div className="relative h-32 w-full bg-white/10 rounded-lg overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white/10">
                  <AcademicCapIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.description || !formData.categoryId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border border-white border-t-transparent rounded-full inline-block"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Course' : 'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// frontend/src/components/admin/ModuleModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
}

interface Course {
  id: number;
  title: string;
}

interface ModuleModalProps {
  module: Module | null; // null for create, module object for edit
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  courseId: number | '';
  order: number;
  isPublished: boolean;
}

export default function ModuleModal({ module, courses, onClose, onSuccess }: ModuleModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    courseId: '',
    order: 1,
    isPublished: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(module);

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        description: module.description,
        courseId: module.course.id,
        order: module.order,
        isPublished: module.isPublished
      });
    } else {
      // For new modules, set default order as next available
      const maxOrder = Math.max(...courses.map(() => 1), 0); // Simplified - you might want to get this from API
      setFormData({
        title: '',
        description: '',
        courseId: courses.length > 0 ? courses[0].id : '',
        order: maxOrder + 1,
        isPublished: false
      });
    }
  }, [module, courses]);

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

    console.log('🔍 ModuleModal: Submitting form data:', formData);

    try {
      if (!formData.courseId) {
        throw new Error('Please select a course');
      }

      const slug = generateSlug(formData.title);
      const requestData = {
        ...formData,
        slug,
        courseId: parseInt(formData.courseId.toString())
      };

      const url = isEditing 
        ? `http://localhost:5000/api/admin/modules/${module!.id}`
        : 'http://localhost:5000/api/admin/modules';
      
      const method = isEditing ? 'PUT' : 'POST';

      console.log(`🔍 ModuleModal: Making ${method} request to:`, url);

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('🔍 ModuleModal: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ ModuleModal: Module saved successfully:', result);

      onSuccess();
      
    } catch (err: unknown) {
      console.error('❌ ModuleModal: Error saving module:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to save module';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'order') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 1
      }));
    } else if (name === 'courseId') {
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
      <div className="bg-gray-800 backdrop-blur-lg border border-white/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Module' : 'Create New Module'}
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

          {/* Module Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Module Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter module title"
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
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe this module"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Course Selection */}
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-300 mb-2">
              Course *
            </label>
            <select
              id="courseId"
              name="courseId"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.courseId}
              onChange={handleInputChange}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Order */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-300 mb-2">
              Order in Course *
            </label>
            <input
              type="number"
              id="order"
              name="order"
              required
              min="1"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
              value={formData.order}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-400 mt-1">
              Order determines the sequence of modules in the course
            </p>
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.isPublished}
              onChange={handleInputChange}
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-300">
              Publish this module
            </label>
          </div>
          <p className="text-xs text-gray-400">
            Published modules will be visible to students
          </p>

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
              disabled={loading || !formData.title || !formData.description || !formData.courseId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border border-white border-t-transparent rounded-full inline-block"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Module' : 'Create Module'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
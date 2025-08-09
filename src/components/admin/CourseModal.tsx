
"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Chapter {
  id: number;
  title: string;
  description?: string;
  moduleId: number; // Changed from courseId to moduleId
  order: number;
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
}

interface Module {
  id: number;
  title: string;
  course?: {
    id: number;
    title: string;
  };
}

interface ChapterModalProps {
  chapter: Chapter | null;
  modules?: Module[]; // Changed from courses to modules
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  moduleId: number | ''; // Changed from courseId to moduleId
  order: number | '';
  status: 'PUBLISHED' | 'DRAFT';
}

export default function ChapterModal({ chapter, modules = [], onClose, onSuccess }: ChapterModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    moduleId: '',
    order: '',
    status: 'DRAFT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(chapter);

  useEffect(() => {
    if (chapter) {
      setFormData({
        title: chapter.title,
        description: chapter.description || '',
        moduleId: chapter.moduleId,
        order: chapter.order,
        status: chapter.status,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        moduleId: '',
        order: '',
        status: 'DRAFT',
      });
    }
  }, [chapter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        moduleId: Number(formData.moduleId), // Changed from courseId to moduleId
        order: Number(formData.order),
      };

      const url = isEditing
        ? `http://localhost:5000/api/admin/chapters/${chapter!.id}`
        : `http://localhost:5000/api/admin/chapters`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      onSuccess();
    } catch (err: unknown) {
      console.error('Error saving chapter:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save chapter';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            {isEditing ? 'Edit Chapter' : 'Create New Chapter'}
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

          {/* Chapter Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Chapter Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chapter title"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter chapter description (optional)"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Module Selection */}
          <div>
            <label htmlFor="moduleId" className="block text-sm font-medium text-gray-300 mb-2">
              Module *
            </label>
            <select
              id="moduleId"
              name="moduleId"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.moduleId}
              onChange={handleInputChange}
            >
              <option value="" className="bg-gray-900">Select a module</option>
              {Array.isArray(modules) && modules.length > 0 ? (
                modules.map((module) => (
                  <option key={module.id} value={module.id} className="bg-gray-900">
                    {module.title} {module.course ? `(${module.course.title})` : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled className="bg-gray-900">
                  No modules available
                </option>
              )}
            </select>
            {(!Array.isArray(modules) || modules.length === 0) && (
              <p className="text-xs text-yellow-400 mt-1">
                No modules available. Create a module first.
              </p>
            )}
          </div>

          {/* Order */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-300 mb-2">
              Order *
            </label>
            <input
              type="number"
              id="order"
              name="order"
              required
              min="1"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Chapter order (1, 2, 3...)"
              value={formData.order}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-400 mt-1">
              Chapter order within the module
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="DRAFT" className="bg-gray-900">Draft - Hidden from students</option>
              <option value="PUBLISHED" className="bg-gray-900">Published - Visible to students</option>
            </select>
          </div>

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
              disabled={loading || !formData.title || !formData.moduleId || !formData.order}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border border-white border-t-transparent rounded-full inline-block"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Chapter' : 'Create Chapter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
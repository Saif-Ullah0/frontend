// components/admin/ModuleModal.tsx - With chapters and paid/free toggle
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Module {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  price?: number;
  isFree?: boolean;
  isPublished: boolean;
  publishStatus?: string;
  orderIndex?: number;
  courseId: number;
  course: {
    id: number;
    title: string;
    category?: {
      id: number;
      name: string;
    };
  };
  chapters?: Array<{
    id: string;
    title: string;
    type: string;
    publishStatus: string;
    order?: number;
  }>;
  _count?: {
    chapters?: number;
  };
  createdAt: string;
}

interface Course {
  id: number;
  title: string;
  publishStatus?: string;
}

interface Chapter {
  id?: string;
  title: string;
  description?: string;
  type: 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ';
  publishStatus: 'DRAFT' | 'PUBLISHED';
  order: number;
}

interface ModuleModalProps {
  module: Module | null;
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModuleModal({ module, courses, onClose, onSuccess }: ModuleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    isFree: true,
    price: 0,
    isPublished: false
  });

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        description: module.description || '',
        courseId: module.courseId.toString(),
        isFree: module.isFree !== undefined ? module.isFree : (module.price === 0),
        price: module.price || 0,
        isPublished: module.isPublished
      });

      // Convert existing chapters
      const existingChapters = module.chapters?.map((chapter, index) => ({
        id: chapter.id,
        title: chapter.title,
        description: '',
        type: (chapter.type as 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ') || 'TEXT',
        publishStatus: (chapter.publishStatus as 'DRAFT' | 'PUBLISHED') || 'DRAFT',
        order: chapter.order || index
      })) || [];

      setChapters(existingChapters);
    } else {
      // Reset for new module
      setFormData({
        title: '',
        description: '',
        courseId: '',
        isFree: true,
        price: 0,
        isPublished: false
      });
      setChapters([]);
    }
    setError(null);
  }, [module]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'isFree') {
        setFormData(prev => ({
          ...prev,
          isFree: checked,
          price: checked ? 0 : prev.price
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else if (name === 'price') {
      setFormData(prev => ({
        ...prev,
        price: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Chapter management
  const addChapter = () => {
    const newChapter: Chapter = {
      title: `Chapter ${chapters.length + 1}`,
      description: '',
      type: 'TEXT',
      publishStatus: 'DRAFT',
      order: chapters.length
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (index: number, updates: Partial<Chapter>) => {
    setChapters(chapters.map((chapter, i) => 
      i === index ? { ...chapter, ...updates } : chapter
    ));
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Module title is required');
      }
      if (!formData.courseId) {
        throw new Error('Please select a course');
      }
      if (!formData.isFree && formData.price <= 0) {
        throw new Error('Price must be greater than 0 for paid modules');
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        courseId: parseInt(formData.courseId),
        isFree: formData.isFree,
        price: formData.isFree ? 0 : formData.price,
        isPublished: formData.isPublished,
        chapters: chapters.map(chapter => ({
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          type: chapter.type,
          publishStatus: chapter.publishStatus,
          order: chapter.order
        }))
      };

      const url = module 
        ? `http://localhost:5000/api/admin/modules/${module.id}`
        : 'http://localhost:5000/api/admin/modules';
      
      const method = module ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${module ? 'update' : 'create'} module`);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving module:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {module ? 'Edit Module' : 'Create New Module'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Basic Information</h3>

              {/* Module Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Module Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter module title..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter module description..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id.toString()}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isFree" className="text-sm font-medium text-gray-300">
                    Free Module
                  </label>
                </div>

                {!formData.isFree && (
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!formData.isFree}
                    />
                  </div>
                )}
              </div>

              {/* Published Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-300">
                  Published (visible to students)
                </label>
              </div>
            </div>

            {/* Chapters Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  Chapters ({chapters.length})
                </h3>
                <button
                  type="button"
                  onClick={addChapter}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Chapter
                </button>
              </div>

              {chapters.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-white/5 rounded-lg border border-white/10">
                  <p>No chapters yet. Add your first chapter!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chapters.map((chapter, index) => (
                    <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => updateChapter(index, { title: e.target.value })}
                            placeholder="Chapter title..."
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={chapter.type}
                              onChange={(e) => updateChapter(index, { type: e.target.value as Chapter['type'] })}
                              className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="TEXT">Text</option>
                              <option value="VIDEO">Video</option>
                              <option value="PDF">PDF</option>
                              <option value="QUIZ">Quiz</option>
                            </select>
                            <select
                              value={chapter.publishStatus}
                              onChange={(e) => updateChapter(index, { publishStatus: e.target.value as Chapter['publishStatus'] })}
                              className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="PUBLISHED">Published</option>
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeChapter(index)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-white/10 p-6 bg-white/5">
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.courseId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  module ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
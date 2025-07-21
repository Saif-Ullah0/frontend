// frontend/src/components/admin/NoteModal.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface Note {
  id: number;
  title: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  isPublished: boolean;
  orderIndex: number;
  courseId: number;
  moduleId?: number;
  course: {
    title: string;
  };
  module?: {
    title: string;
  };
}

interface Course {
  id: number;
  title: string;
}

interface Module {
  id: number;
  title: string;
  courseId: number;
}

interface NoteModalProps {
  note?: Note | null;
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function NoteModal({ note, courses, onClose, onSuccess }: NoteModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    courseId: '',
    moduleId: '',
    orderIndex: '0',
    isPublished: false
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        description: note.description || '',
        content: note.content || '',
        courseId: note.courseId.toString(),
        moduleId: note.moduleId?.toString() || '',
        orderIndex: note.orderIndex.toString(),
        isPublished: note.isPublished
      });
      
      // Load modules for the note's course
      if (note.courseId) {
        loadModules(note.courseId);
      }
    }
  }, [note]);

  useEffect(() => {
    if (formData.courseId) {
      loadModules(parseInt(formData.courseId));
    } else {
      setModules([]);
      setFormData(prev => ({ ...prev, moduleId: '' }));
    }
  }, [formData.courseId]);

  const loadModules = async (courseId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const courseData = await response.json();
        setModules(courseData.modules || []);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only PDF, DOC, DOCX, TXT, PPT, PPTX files are allowed.');
        return;
      }
      
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size too large. Maximum file size is 50MB.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.courseId) {
      setError('Course selection is required');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('content', formData.content);
      submitData.append('courseId', formData.courseId);
      submitData.append('orderIndex', formData.orderIndex);
      submitData.append('isPublished', formData.isPublished.toString());
      
      if (formData.moduleId) {
        submitData.append('moduleId', formData.moduleId);
      }
      
      if (selectedFile) {
        submitData.append('noteFile', selectedFile);
      }
      
      const url = note 
        ? `http://localhost:5000/api/notes/${note.id}`
        : 'http://localhost:5000/api/notes';
        
      const method = note ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: submitData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save note');
      }
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error saving note:', error);
      setError(error instanceof Error ? error.message : 'Failed to save note');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {note ? 'Edit Note' : 'Add New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter note title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter note description"
            />
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course *
            </label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
              required
            >
              <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
                Select Course
              </option>
              {courses.map(course => (
                <option 
                  key={course.id} 
                  value={course.id}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                >
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Module Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Module (Optional)
            </label>
            <select
              name="moduleId"
              value={formData.moduleId}
              onChange={handleInputChange}
              disabled={!formData.courseId}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
            >
              <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
                Select Module (Optional)
              </option>
              {modules.map(module => (
                <option 
                  key={module.id} 
                  value={module.id}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                >
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          {/* Content (Text) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content (Text Notes)
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={5}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter note content (optional if uploading file)"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload File (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
              <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-300 mb-2">
                Click to upload or drag and drop
              </div>
              <div className="text-sm text-gray-400 mb-4">
                PDF, DOC, DOCX, TXT, PPT, PPTX (Max 50MB)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose File
              </button>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      <div className="font-medium">{selectedFile.name}</div>
                      <div className="text-gray-400">{formatFileSize(selectedFile.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {note?.fileUrl && !selectedFile && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-300">
                    <div className="font-medium">Current file: {note.fileName}</div>
                    <div className="text-gray-400">
                      {note.fileSize && formatFileSize(parseInt(note.fileSize))} • {note.fileType?.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order Index
              </label>
              <input
                type="number"
                name="orderIndex"
                value={formData.orderIndex}
                onChange={handleInputChange}
                min="0"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center gap-2 p-3">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300">Published</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {note ? 'Updating...' : 'Uploading...'}
                </>
              ) : (
                note ? 'Update Note' : 'Create Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
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
  chapterId?: number; // Added chapter support
  course: {
    title: string;
  };
  module?: {
    title: string;
  };
  chapter?: { // Added chapter support
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

interface Chapter {
  id: number;
  title: string;
  moduleId: number;
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
    chapterId: '', // Added chapter support
    orderIndex: '0',
    isPublished: false
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
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
        chapterId: note.chapterId?.toString() || '', // Added chapter support
        orderIndex: note.orderIndex.toString(),
        isPublished: note.isPublished
      });
      
      // Load modules for the note's course
      if (note.courseId) {
        loadModules(note.courseId);
      }
      
      // Load chapters for the note's module
      if (note.moduleId) {
        loadChapters(note.moduleId);
      }
    }
  }, [note]);

  useEffect(() => {
    console.log('🔍 Frontend: useEffect triggered for courseId:', formData.courseId);
    if (formData.courseId) {
      console.log('🔍 Frontend: About to load modules for courseId:', formData.courseId);
      loadModules(parseInt(formData.courseId));
    } else {
      console.log('🔍 Frontend: Clearing modules and chapters (no courseId)');
      setModules([]);
      setChapters([]);
      setFormData(prev => ({ ...prev, moduleId: '', chapterId: '' }));
    }
  }, [formData.courseId]);

  useEffect(() => {
    console.log('🔍 Frontend: useEffect triggered for moduleId:', formData.moduleId);
    if (formData.moduleId) {
      console.log('🔍 Frontend: About to load chapters for moduleId:', formData.moduleId);
      loadChapters(parseInt(formData.moduleId));
    } else {
      console.log('🔍 Frontend: Clearing chapters (no moduleId)');
      setChapters([]);
      setFormData(prev => ({ ...prev, chapterId: '' }));
    }
  }, [formData.moduleId]);

  // Add this new useEffect to monitor chapters state changes
  useEffect(() => {
    console.log('📊 Frontend: Chapters state updated:', {
      count: chapters.length,
      chapters: chapters.map(ch => ({ id: ch.id, title: ch.title }))
    });
  }, [chapters]);

  // Add this new useEffect to monitor form data changes
  useEffect(() => {
    console.log('📋 Frontend: Form data updated:', formData);
  }, [formData]);

  // Add this new useEffect to monitor modules state changes
  useEffect(() => {
    console.log('📦 Frontend: Modules state updated:', {
      count: modules.length,
      modules: modules.map(m => ({ id: m.id, title: m.title }))
    });
  }, [modules]);

  const loadModules = async (courseId: number) => {
    console.log('🔍 Frontend: Loading modules for course:', courseId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        credentials: 'include'
      });
      
      console.log('🔍 Frontend: Modules API response status:', response.status);
      console.log('🔍 Frontend: Modules API response ok:', response.ok);
      
      if (response.ok) {
        const courseData = await response.json();
        console.log('🔍 Frontend: Course data received:', courseData);
        
        // Fix: The modules are nested under courseData.course.modules
        const modules = courseData.course?.modules || courseData.modules || [];
        
        console.log('🔍 Frontend: Modules found:', modules.length);
        console.log('🔍 Frontend: Modules data:', modules);
        
        setModules(modules);
        console.log('✅ Frontend: Modules set in state:', modules.length);
      } else {
        console.error('❌ Frontend: Modules API response not ok:', response.status);
        const errorText = await response.text();
        console.error('❌ Frontend: Modules error response:', errorText);
        setModules([]);
      }
    } catch (error) {
      console.error('❌ Frontend: Error loading modules:', error);
      setModules([]);
    }
  };

  const loadChapters = async (moduleId: number) => {
    console.log('🔍 Frontend: Loading chapters for module:', moduleId);
    
    // Clear existing chapters first
    setChapters([]);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/modules/${moduleId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔍 Frontend: Response status:', response.status);
      console.log('🔍 Frontend: Response ok:', response.ok);
      
      if (response.ok) {
        const moduleData = await response.json();
        console.log('🔍 Frontend: Module data received:', moduleData);
        console.log('🔍 Frontend: Chapters found:', moduleData.chapters?.length || 0);
        console.log('🔍 Frontend: Chapters data:', moduleData.chapters);
        
        // Ensure chapters is an array
        const chapters = Array.isArray(moduleData.chapters) ? moduleData.chapters : [];
        console.log('🔍 Frontend: Setting chapters array:', chapters);
        
        setChapters(chapters);
        console.log('✅ Frontend: setChapters called with:', chapters.length, 'chapters');
      } else {
        console.error('❌ Frontend: API response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Frontend: Error response body:', errorText);
      }
    } catch (error) {
      console.error('❌ Frontend: Catch block - Error loading chapters:', error);
      setChapters([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    console.log('🔄 Frontend: Input change detected:', { name, value, type });
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      console.log('🔄 Frontend: Checkbox change:', { name, checked });
      setFormData(prev => {
        const newData = { ...prev, [name]: checked };
        console.log('🔄 Frontend: New form data after checkbox change:', newData);
        return newData;
      });
    } else {
      console.log('🔄 Frontend: Regular input change:', { name, value });
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        console.log('🔄 Frontend: New form data after input change:', newData);
        return newData;
      });
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
      
      if (formData.chapterId) { // Added chapter support
        submitData.append('chapterId', formData.chapterId);
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

  const getLocationText = () => {
    if (!formData.courseId) return 'Select where to add this note';
    
    const courseName = courses.find(c => c.id === parseInt(formData.courseId))?.title || 'Course';
    const moduleName = modules.find(m => m.id === parseInt(formData.moduleId))?.title;
    const chapterName = chapters.find(c => c.id === parseInt(formData.chapterId))?.title;
    
    let location = `📚 ${courseName}`;
    if (moduleName) {
      location += ` > 📁 ${moduleName}`;
      if (chapterName) {
        location += ` > 📄 ${chapterName}`;
      }
    }
    
    return location;
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

        {/* Location Display */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-400 font-medium text-sm mb-1">Note Location:</p>
          <p className="text-white">{getLocationText()}</p>
          {formData.courseId && (
            <p className="text-gray-400 text-xs mt-1">
              {!formData.moduleId && !formData.chapterId ? 'This note will be added to the course level' :
               !formData.chapterId ? 'This note will be added to the module level' :
               'This note will be added to the chapter level'}
            </p>
          )}
        </div>

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
              Course * <span className="text-xs text-gray-500">(Required)</span>
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
              Module <span className="text-xs text-gray-500">(Optional - Note can be added to course level)</span>
            </label>
            {/* Debug info for modules */}
            <div className="text-xs text-gray-500 mb-1">
              Debug: Modules available: {modules.length} | CourseId: {formData.courseId} | Selected ModuleId: {formData.moduleId}
            </div>
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
              {modules.map(module => {
                console.log('🔍 Rendering module option:', module);
                return (
                  <option 
                    key={module.id} 
                    value={module.id}
                    style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                  >
                    {module.title}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Chapter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chapter <span className="text-xs text-gray-500">(Optional - Note can be added to module level)</span>
            </label>
            {/* Debug info */}
            <div className="text-xs text-gray-500 mb-1">
              Debug: Chapters in state: {chapters.length} | ModuleId: {formData.moduleId} | ChapterId: {formData.chapterId}
            </div>
            <select
              name="chapterId"
              value={formData.chapterId}
              onChange={handleInputChange}
              disabled={!formData.moduleId}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
            >
              <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
                Select Chapter (Optional)
              </option>
              {chapters.length > 0 ? chapters.map((chapter, index) => {
                console.log('🔍 Rendering chapter option #', index, ':', chapter);
                return (
                  <option 
                    key={chapter.id} 
                    value={chapter.id}
                    style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                  >
                    {chapter.title}
                  </option>
                );
              }) : (
                <option disabled style={{ backgroundColor: '#1f2937', color: '#666' }}>
                  No chapters available
                </option>
              )}
            </select>
            
            {/* More debug info */}
            {chapters.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Available chapters: {chapters.map(ch => ch.title).join(', ')}
              </div>
            )}
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
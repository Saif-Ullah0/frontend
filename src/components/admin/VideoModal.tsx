"use client";

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface Video {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number;
  thumbnailUrl?: string;
  isPublished: boolean;
  orderIndex: number;
  courseId: number;
  moduleId?: number;
  chapterId?: string;
  course: {
    title: string;
  };
  module?: {
    title: string;
  };
  chapter?: {
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
  id: string;
  title: string;
  moduleId: number;
}

interface VideoModalProps {
  video?: Video | null;
  courses: Course[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function VideoModal({ video, courses, onClose, onSuccess }: VideoModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    courseId: '',
    moduleId: '',
    chapterId: '',
    duration: '',
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
    if (video) {
      setFormData({
        title: video.title,
        description: video.description || '',
        videoUrl: video.videoUrl || '',
        courseId: video.courseId.toString(),
        moduleId: video.moduleId?.toString() || '',
        chapterId: video.chapterId || '',
        duration: video.duration?.toString() || '',
        orderIndex: video.orderIndex.toString(),
        isPublished: video.isPublished
      });
      
      // Load modules for the video's course
      if (video.courseId) {
        loadModules(video.courseId);
      }
      
      // Load chapters for the video's module
      if (video.moduleId) {
        loadChapters(video.moduleId);
      }
    }
  }, [video]);

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

  const loadModules = async (courseId: number) => {
    console.log('🔍 Frontend: Loading modules for course:', courseId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔍 Frontend: Modules API response status:', response.status);
      
      if (response.ok) {
        const courseData = await response.json();
        console.log('🔍 Frontend: Course data received:', courseData);
        
        // Fix: The modules are nested under courseData.course.modules
        const modules = courseData.course?.modules || courseData.modules || [];
        
        console.log('🔍 Frontend: Modules found:', modules.length);
        setModules(modules);
        console.log('✅ Frontend: Modules set in state:', modules.length);
      } else {
        console.error('❌ Frontend: Modules API response not ok:', response.status);
        setModules([]);
      }
    } catch (error) {
      console.error('❌ Frontend: Error loading modules:', error);
      setModules([]);
    }
  };

  const loadChapters = async (moduleId: number) => {
    console.log('🔍 Frontend: Loading chapters for module:', moduleId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/modules/${moduleId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔍 Frontend: Chapters API response status:', response.status);
      
      if (response.ok) {
        const moduleData = await response.json();
        console.log('🔍 Frontend: Module data received:', moduleData);
        console.log('🔍 Frontend: Chapters found:', moduleData.chapters?.length || 0);
        
        const chapters = Array.isArray(moduleData.chapters) ? moduleData.chapters : [];
        setChapters(chapters);
        console.log('✅ Frontend: Chapters set in state:', chapters.length);
      } else {
        console.error('❌ Frontend: Chapters API response not ok:', response.status);
      }
    } catch (error) {
      console.error('❌ Frontend: Error loading chapters:', error);
      setChapters([]);
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
      // Check file type - accept common video formats
      const allowedTypes = [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/flv',
        'video/webm',
        'video/mkv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload MP4, AVI, MOV, WMV, FLV, WebM, or MKV files.');
        return;
      }
      
      // Check file size (500MB limit for videos)
      if (file.size > 500 * 1024 * 1024) {
        setError('File size too large. Maximum file size is 500MB.');
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
    
    // Must have either a video URL or a video file
    if (!formData.videoUrl && !selectedFile) {
      setError('Either a video URL or video file is required');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('videoUrl', formData.videoUrl);
      submitData.append('courseId', formData.courseId);
      submitData.append('orderIndex', formData.orderIndex);
      submitData.append('isPublished', formData.isPublished.toString());
      
      if (formData.duration) {
        submitData.append('duration', formData.duration);
      }
      
      if (formData.moduleId) {
        submitData.append('moduleId', formData.moduleId);
      }
      
      if (formData.chapterId) {
        submitData.append('chapterId', formData.chapterId);
      }
      
      if (selectedFile) {
        submitData.append('videoFile', selectedFile);
      }
      
      const url = video 
        ? `http://localhost:5000/api/videos/${video.id}`
        : 'http://localhost:5000/api/videos';
        
      const method = video ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: submitData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save video');
      }
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error saving video:', error);
      setError(error instanceof Error ? error.message : 'Failed to save video');
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
    if (!formData.courseId) return 'Select where to add this video';
    
    const courseName = courses.find(c => c.id === parseInt(formData.courseId))?.title || 'Course';
    const moduleName = modules.find(m => m.id === parseInt(formData.moduleId))?.title;
    const chapterName = chapters.find(c => c.id === formData.chapterId)?.title;
    
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
            {video ? 'Edit Video' : 'Add New Video'}
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
          <p className="text-blue-400 font-medium text-sm mb-1">Video Location:</p>
          <p className="text-white">{getLocationText()}</p>
          {formData.courseId && (
            <p className="text-gray-400 text-xs mt-1">
              {!formData.moduleId && !formData.chapterId ? 'This video will be added to the course level' :
               !formData.chapterId ? 'This video will be added to the module level' :
               'This video will be added to the chapter level'}
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
              placeholder="Enter video title"
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
              placeholder="Enter video description"
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
              Module <span className="text-xs text-gray-500">(Optional - Video can be added to course level)</span>
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

          {/* Chapter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chapter <span className="text-xs text-gray-500">(Optional - Video can be added to module level)</span>
            </label>
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
              {chapters.map(chapter => (
                <option 
                  key={chapter.id} 
                  value={chapter.id}
                  style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
                >
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video URL <span className="text-xs text-gray-500">(YouTube, Vimeo, or direct link)</span>
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Video File <span className="text-xs text-gray-500">(Alternative to URL)</span>
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-300 mb-2">
                Click to upload or drag and drop
              </div>
              <div className="text-sm text-gray-400 mb-4">
                MP4, AVI, MOV, WMV, FLV, WebM, MKV (Max 500MB)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Video File
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

              {video?.videoUrl && !selectedFile && !formData.videoUrl && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-300">
                    <div className="font-medium">Current video: {video.fileName || 'Video file'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Duration and Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="0"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="300"
              />
            </div>
            
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
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2">
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
                  {video ? 'Updating...' : 'Uploading...'}
                </>
              ) : (
                video ? 'Update Video' : 'Create Video'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
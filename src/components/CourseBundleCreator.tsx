// frontend/src/components/CourseBundleCreator.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ShoppingBagIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CalculatorIcon,
  BookOpenIcon,
  AcademicCapIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

// ✅ FIXED: Updated interface to match API response
interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  publishStatus: string;  // ✅ Changed from isPublished to publishStatus
  isPaid: boolean;        // ✅ Added isPaid field
  category: {
    id: number;
    name: string;
  };
  modules: Array<{
    id: number;
    title: string;
    duration?: number;
  }>;
  // ✅ REMOVED: user field (not returned by API)
}

interface CourseBundleCreatorProps {
  onBundleCreated?: () => void;
  className?: string;
}

export default function CourseBundleCreator({ onBundleCreated, className = "" }: CourseBundleCreatorProps) {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundleDescription, setBundleDescription] = useState('');
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    if (showCreator) {
      fetchAvailableCourses();
    }
  }, [showCreator]);

  useEffect(() => {
    // Filter courses based on search term and category
    let filtered = availableCourses;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category.name === categoryFilter);
    }
    
    setFilteredCourses(filtered);
  }, [availableCourses, searchTerm, categoryFilter]);

  const fetchAvailableCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const courses = await response.json();
        console.log('📚 All courses received:', courses);

        // ✅ FIXED: Correct filtering logic
        const publishedCourses = courses.filter((course: Course) => 
          course.publishStatus === 'PUBLISHED' && course.price > 0  // ✅ Use publishStatus
        );

        console.log('✅ Filtered published courses:', publishedCourses);

        setAvailableCourses(publishedCourses);
        setFilteredCourses(publishedCourses);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Map(publishedCourses.map((course: Course) => [course.category.id, course.category])).values()
        );
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const toggleCourseSelection = (courseId: number) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const calculatePricing = () => {
    const totalPrice = selectedCourses.reduce((sum, courseId) => {
      const course = availableCourses.find(c => c.id === courseId);
      return sum + (course?.price || 0);
    }, 0);
    
    const discountAmount = (totalPrice * discount) / 100;
    const finalPrice = totalPrice - discountAmount;
    
    return { totalPrice, discountAmount, finalPrice };
  };

  const handleCreateBundle = async () => {
    if (!bundleName.trim()) {
      toast.error('Please enter a bundle name');
      return;
    }
    
    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/bundles/create/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bundleName,
          description: bundleDescription,
          courseIds: selectedCourses,
          discount
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Course bundle created successfully! 🎉');
        resetForm();
        setShowCreator(false);
        onBundleCreated?.();
      } else {
        toast.error(data.error || 'Failed to create bundle');
      }
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBundleName('');
    setBundleDescription('');
    setSelectedCourses([]);
    setDiscount(0);
    setSearchTerm('');
    setCategoryFilter('all');
  };

  const { totalPrice, discountAmount, finalPrice } = calculatePricing();

  if (!showCreator) {
    return (
      <button
        onClick={() => setShowCreator(true)}
        className={`w-full p-6 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-2xl hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-300 flex items-center justify-center gap-3 group ${className}`}
      >
        <PlusIcon className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
        <span className="text-lg font-semibold text-white">Create New Course Bundle</span>
      </button>
    );
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Create Course Bundle</h3>
          <p className="text-gray-400">Select courses and create your comprehensive learning package</p>
        </div>
        <button
          onClick={() => {
            setShowCreator(false);
            resetForm();
          }}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Bundle Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Bundle Name *
            </label>
            <input
              type="text"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="e.g., Complete Web Development Mastery"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Description (Optional)
            </label>
            <textarea
              value={bundleDescription}
              onChange={(e) => setBundleDescription(e.target.value)}
              placeholder="Describe what this course bundle includes and who it's designed for..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <TagIcon className="w-4 h-4 inline mr-2" />
              Discount Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                min="0"
                max="50"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
              <span className="absolute right-3 top-3 text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Maximum 50% discount for course bundles</p>
          </div>

          {/* Pricing Preview */}
          {selectedCourses.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CalculatorIcon className="w-4 h-4" />
                Pricing Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Courses ({selectedCourses.length}):</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-white border-t border-white/10 pt-2">
                  <span>Final Price:</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="text-xs text-green-400 text-center">
                    Save ${discountAmount.toFixed(2)}!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-white">
            Select Courses ({selectedCourses.length} selected)
          </h4>
          
          <div className="flex gap-4">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {/* Search */}
            <div className="relative w-64">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="max-h-96 overflow-y-auto space-y-4 custom-scrollbar">
          {loadingCourses ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {searchTerm || categoryFilter !== 'all' ? 'No courses match your filters' : 'No published courses available'}
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`p-6 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                  selectedCourses.includes(course.id)
                    ? 'bg-green-500/20 border-green-500/50 ring-2 ring-green-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => toggleCourseSelection(course.id)}
              >
                <div className="flex items-start gap-4">
                  {course.imageUrl ? (
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AcademicCapIcon className="w-8 h-8 text-green-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-white mb-2">{course.title}</h5>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {course.category.name}
                      </span>
                      <span>{course.modules.length} modules</span>
                      {/* ✅ REMOVED: user.name since API doesn't return it */}
                    </div>
                    
                    <div className="text-2xl font-bold text-white">
                      ${course.price}
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    selectedCourses.includes(course.id)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-400 hover:border-green-400'
                  }`}>
                    {selectedCourses.includes(course.id) && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            setShowCreator(false);
            resetForm();
          }}
          className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateBundle}
          disabled={loading || !bundleName.trim() || selectedCourses.length === 0}
          className="flex-2 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-48"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating Bundle...
            </>
          ) : (
            <>
              <ShoppingBagIcon className="w-5 h-5" />
              Create Course Bundle
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.7);
        }
      `}</style>
    </div>
  );
}
// frontend/src/components/EnhancedBundleCreator.tsx
"use client";

import { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  TagIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  AcademicCapIcon,
  FolderIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Course {
  id: number;
  title: string;
  description?: string;
  price: number;
  isPaid: boolean;
  imageUrl?: string;
  duration: number;
  category: {
    id: number;
    name: string;
  };
}

interface Module {
  id: number;
  title: string;
  description?: string;
  price: number;
  isFree: boolean;
  duration: number;
  course: {
    id: number;
    title: string;
    category: {
      name: string;
    };
  };
}

interface EnhancedBundleCreatorProps {
  onBundleCreated: () => void;
}

type BundleType = 'COURSE' | 'MODULE';

export default function EnhancedBundleCreator({ onBundleCreated }: EnhancedBundleCreatorProps) {
  const [bundleType, setBundleType] = useState<BundleType>('COURSE');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [selectedModules, setSelectedModules] = useState<Module[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundleDescription, setBundleDescription] = useState('');
  const [discount, setDiscount] = useState(10);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (bundleType === 'COURSE') {
      fetchAvailableCourses();
    } else {
      fetchAvailableModules();
    }
  }, [bundleType]);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bundles/courses/available', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📚 Available courses:', data);
        setAvailableCourses(data.courses || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch courses:', errorData);
        toast.error('Failed to load available courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Something went wrong while loading courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bundles/modules/available', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📚 Available modules:', data);
        setAvailableModules(data.modules || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch modules:', errorData);
        toast.error('Failed to load available modules');
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Something went wrong while loading modules');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (course: Course) => {
    const isSelected = selectedCourses.some(c => c.id === course.id);
    
    if (isSelected) {
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleModuleToggle = (module: Module) => {
    const isSelected = selectedModules.some(m => m.id === module.id);
    
    if (isSelected) {
      setSelectedModules(selectedModules.filter(m => m.id !== module.id));
    } else {
      setSelectedModules([...selectedModules, module]);
    }
  };

  const handleBundleTypeChange = (type: BundleType) => {
    setBundleType(type);
    setSelectedCourses([]);
    setSelectedModules([]);
    setSearchTerm('');
  };

  const handleCreateBundle = async () => {
    if (!bundleName.trim()) {
      toast.error('Please enter a bundle name');
      return;
    }

    const selectedItems = bundleType === 'COURSE' ? selectedCourses : selectedModules;
    if (selectedItems.length === 0) {
      toast.error(`Please select at least one ${bundleType.toLowerCase()}`);
      return;
    }

    try {
      setCreating(true);

      const bundleData = {
        name: bundleName.trim(),
        description: bundleDescription.trim() || null,
        discount: Math.max(0, Math.min(100, discount)),
        isPublic: isPublic
      };

      let endpoint = '';
      if (bundleType === 'COURSE') {
        bundleData.courseIds = selectedCourses.map(course => course.id);
        endpoint = 'http://localhost:5000/api/bundles/courses';
      } else {
        bundleData.moduleIds = selectedModules.map(module => module.id);
        endpoint = 'http://localhost:5000/api/bundles/modules';
      }

      console.log('🔍 Creating bundle with data:', bundleData);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(bundleData)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Bundle created successfully:', result);
        toast.success(`${bundleType} bundle created successfully!`);
        
        // Reset form
        setBundleName('');
        setBundleDescription('');
        setSelectedCourses([]);
        setSelectedModules([]);
        setDiscount(10);
        setIsPublic(false);
        
        // Call parent callback
        onBundleCreated();
      } else {
        console.error('❌ Bundle creation failed:', result);
        toast.error(result.error || 'Failed to create bundle');
      }
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast.error('Something went wrong while creating the bundle');
    } finally {
      setCreating(false);
    }
  };

  // Calculate pricing based on bundle type
  const selectedItems = bundleType === 'COURSE' ? selectedCourses : selectedModules;
  const totalOriginalPrice = bundleType === 'COURSE' 
    ? selectedCourses.filter(course => course.isPaid).reduce((sum, course) => sum + course.price, 0)
    : selectedModules.filter(module => !module.isFree).reduce((sum, module) => sum + module.price, 0);

  const discountAmount = (totalOriginalPrice * discount) / 100;
  const finalPrice = totalOriginalPrice - discountAmount;
  const savings = discountAmount;

  // Filter items based on search
  const filteredCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModules = availableModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.course.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredItems = bundleType === 'COURSE' ? filteredCourses : filteredModules;

  return (
    <div className="space-y-8">
      {/* Header with Bundle Type Selection */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-green-500/20 rounded-2xl">
            <PlusIcon className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Create Bundle</h2>
            <p className="text-gray-400">Package multiple items together with a discount</p>
          </div>
        </div>

        {/* Bundle Type Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
            Bundle Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => handleBundleTypeChange('COURSE')}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                bundleType === 'COURSE'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <AcademicCapIcon className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Course Bundle</p>
                <p className="text-sm opacity-75">Package complete courses</p>
              </div>
            </button>

            <button
              onClick={() => handleBundleTypeChange('MODULE')}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                bundleType === 'MODULE'
                  ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <FolderIcon className="w-6 h-6" />
              <div className="text-left">
                <p className="font-semibold">Module Bundle</p>
                <p className="text-sm opacity-75">Package specific modules</p>
              </div>
            </button>
          </div>
        </div>

        {/* Bundle Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Bundle Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Bundle Name *
              </label>
              <input
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder={`e.g., Complete ${bundleType === 'COURSE' ? 'Web Development' : 'React Fundamentals'} Bundle`}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{bundleName.length}/100 characters</p>
            </div>

            {/* Bundle Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={bundleDescription}
                onChange={(e) => setBundleDescription(e.target.value)}
                placeholder="Describe what students will learn and why this bundle is valuable..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{bundleDescription.length}/500 characters</p>
            </div>

            {/* Bundle Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Bundle Settings
              </h3>
              
              {/* Discount */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Discount Percentage
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={discount}
                    onChange={(e) => setDiscount(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center gap-1 text-white font-bold">
                    <span className="text-2xl">{discount}%</span>
                    <TagIcon className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Recommended: 10-30% for maximum appeal</p>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <GlobeAltIcon className="w-6 h-6 text-blue-400" />
                  ) : (
                    <LockClosedIcon className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <p className="font-semibold text-white">
                      {isPublic ? 'Public Bundle' : 'Private Bundle'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {isPublic 
                        ? 'Visible in marketplace and search results' 
                        : 'Only you can see this bundle'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    isPublic ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className={`bg-gradient-to-br rounded-2xl p-6 border ${
            bundleType === 'COURSE' 
              ? 'from-blue-500/10 to-green-500/10 border-blue-500/30' 
              : 'from-purple-500/10 to-pink-500/10 border-purple-500/30'
          }`}>
            <h3 className={`text-xl font-bold text-white mb-4 flex items-center gap-2`}>
              <CurrencyDollarIcon className={`w-6 h-6 ${bundleType === 'COURSE' ? 'text-blue-400' : 'text-purple-400'}`} />
              Pricing Preview
            </h3>
            
            {selectedItems.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Original Price:</span>
                    <span className="text-white font-semibold">${totalOriginalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Discount ({discount}%):</span>
                    <span className="text-red-400 font-semibold">-${discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Bundle Price:</span>
                      <span className={`text-2xl font-bold ${bundleType === 'COURSE' ? 'text-blue-400' : 'text-purple-400'}`}>
                        ${finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {savings > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <SparklesIcon className="w-5 h-5" />
                      <span>Students save ${savings.toFixed(2)}!</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-300">
                    Selected {bundleType === 'COURSE' ? 'Courses' : 'Modules'} ({selectedItems.length}):
                  </p>
                  <div className="space-y-1">
                    {selectedItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 truncate">{item.title}</span>
                        <span className="text-white font-medium">
                          {bundleType === 'COURSE' 
                            ? ((item as Course).isPaid ? `$${item.price}` : 'Free')
                            : (!(item as Module).isFree ? `$${item.price}` : 'Free')
                          }
                        </span>
                      </div>
                    ))}
                    {selectedItems.length > 3 && (
                      <p className="text-xs text-gray-500">+{selectedItems.length - 3} more {bundleType === 'COURSE' ? 'courses' : 'modules'}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {bundleType === 'COURSE' ? (
                  <AcademicCapIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                ) : (
                  <FolderIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                )}
                <p className="text-gray-400">Select {bundleType === 'COURSE' ? 'courses' : 'modules'} to see pricing</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Selection */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            Select {bundleType === 'COURSE' ? 'Courses' : 'Modules'}
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${bundleType === 'COURSE' ? 'courses' : 'modules'}...`}
                className="pl-4 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <span className="text-sm text-gray-400">
              {selectedItems.length} of {filteredItems.length} selected
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-white">Loading {bundleType === 'COURSE' ? 'courses' : 'modules'}...</span>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            {bundleType === 'COURSE' ? (
              <AcademicCapIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            ) : (
              <FolderIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            )}
            <h4 className="text-xl font-semibold text-white mb-2">
              No {bundleType === 'COURSE' ? 'Courses' : 'Modules'} Available
            </h4>
            <p className="text-gray-400">
              {searchTerm 
                ? `No ${bundleType === 'COURSE' ? 'courses' : 'modules'} match your search criteria`
                : `No published ${bundleType === 'COURSE' ? 'courses' : 'modules'} found`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundleType === 'COURSE' 
              ? filteredCourses.map((course) => {
                  const isSelected = selectedCourses.some(c => c.id === course.id);
                  
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleCourseToggle(course)}
                      className={`relative p-6 border rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        isSelected
                          ? 'border-blue-500/50 bg-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {/* Selection Indicator */}
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                      </div>

                      {/* Course Image */}
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-32 object-cover rounded-xl mb-4"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-4 flex items-center justify-center">
                          <AcademicCapIcon className="w-8 h-8 text-white/50" />
                        </div>
                      )}

                      {/* Course Info */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-white text-lg line-clamp-2">{course.title}</h4>
                        
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {course.category.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            course.isPaid 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {course.isPaid ? `$${course.price}` : 'Free'}
                          </span>
                        </div>

                        {course.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{Math.round(course.duration / 60)} hours</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              : filteredModules.map((module) => {
                  const isSelected = selectedModules.some(m => m.id === module.id);
                  
                  return (
                    <div
                      key={module.id}
                      onClick={() => handleModuleToggle(module)}
                      className={`relative p-6 border rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        isSelected
                          ? 'border-purple-500/50 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {/* Selection Indicator */}
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-400'
                      }`}>
                        {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                      </div>

                      {/* Module Icon */}
                      <div className="w-full h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-4 flex items-center justify-center">
                        <FolderIcon className="w-8 h-8 text-white/50" />
                      </div>

                      {/* Module Info */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-white text-lg line-clamp-2">{module.title}</h4>
                        
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            {module.course.category.name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            !module.isFree 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {!module.isFree ? `$${module.price}` : 'Free'}
                          </span>
                        </div>

                        <p className="text-sm text-gray-400">
                          From: {module.course.title}
                        </p>

                        {module.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">{module.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{Math.round(module.duration / 60)} min</span>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}
      </div>

      {/* Create Bundle Button */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${bundleType === 'COURSE' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
              <CheckCircleIcon className={`w-8 h-8 ${bundleType === 'COURSE' ? 'text-blue-400' : 'text-purple-400'}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Ready to Create Bundle?</h3>
              <p className="text-gray-400">
                {selectedItems.length > 0 
                  ? `Bundle ${selectedItems.length} ${bundleType === 'COURSE' ? 'courses' : 'modules'} with ${discount}% discount`
                  : `Select ${bundleType === 'COURSE' ? 'courses' : 'modules'} and configure your bundle above`
                }
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateBundle}
            disabled={creating || !bundleName.trim() || selectedItems.length === 0}
            className={`px-8 py-4 bg-gradient-to-r text-white rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none ${
              bundleType === 'COURSE'
                ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700'
                : 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700'
            }`}
          >
            {creating ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Bundle...
              </>
            ) : (
              <>
                <PlusIcon className="w-6 h-6" />
                Create {bundleType} Bundle
              </>
            )}
          </button>
        </div>

        {/* Validation Messages */}
        {(!bundleName.trim() || selectedItems.length === 0) && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-400">
              <InformationCircleIcon className="w-5 h-5" />
              <span className="font-semibold">Complete these steps:</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-yellow-200">
              {!bundleName.trim() && <li>• Enter a bundle name</li>}
              {selectedItems.length === 0 && <li>• Select at least one {bundleType.toLowerCase()}</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
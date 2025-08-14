// frontend/src/components/BundleCreator.tsx
"use client";

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  BookOpenIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Course {
  id: number;
  title: string;
  description?: string;
  price: number;
  isPaid: boolean;
  imageUrl?: string;
  category: { name: string };
}

interface Module {
  id: number;
  title: string;
  description?: string;
  price: number;
  isFree: boolean;
  course: {
    title: string;
    category: { name: string };
  };
}

interface BundleCreatorProps {
  onBundleCreated: () => void;
}

export default function BundleCreator({ onBundleCreated }: BundleCreatorProps) {
  const [bundleType, setBundleType] = useState<'COURSE' | 'MODULE'>('COURSE');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState(10);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (bundleType === 'COURSE') {
      fetchAvailableCourses();
    } else {
      fetchAvailableModules();
    }
    setSelectedItems([]); // Reset selections when type changes
  }, [bundleType]);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bundles/items/courses', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCourses(data.courses || []);
      } else {
        toast.error('Failed to load available courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/bundles/items/modules', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableModules(data.modules || []);
      } else {
        toast.error('Failed to load available modules');
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculatePricing = () => {
    let totalPrice = 0;
    
    if (bundleType === 'COURSE') {
      const selectedCourses = availableCourses.filter(course => selectedItems.includes(course.id));
      totalPrice = selectedCourses.reduce((sum, course) => sum + (course.isPaid ? course.price : 0), 0);
    } else {
      const selectedModules = availableModules.filter(module => selectedItems.includes(module.id));
      totalPrice = selectedModules.reduce((sum, module) => sum + (!module.isFree ? module.price : 0), 0);
    }
    
    const finalPrice = totalPrice * (1 - discount / 100);
    const savings = totalPrice - finalPrice;
    
    return { totalPrice, finalPrice, savings };
  };

  const handleCreateBundle = async () => {
    if (!name.trim()) {
      toast.error('Bundle name is required');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error(`Please select at least one ${bundleType.toLowerCase()}`);
      return;
    }

    try {
      setCreateLoading(true);
      
      const response = await fetch('http://localhost:5000/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          type: bundleType,
          itemIds: selectedItems,
          discount,
          isPublic
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bundle created successfully!');
        // Reset form
        setName('');
        setDescription('');
        setDiscount(10);
        setIsPublic(false);
        setSelectedItems([]);
        onBundleCreated();
      } else {
        toast.error(data.error || 'Failed to create bundle');
      }
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast.error('Failed to create bundle');
    } finally {
      setCreateLoading(false);
    }
  };

  const { totalPrice, finalPrice, savings } = calculatePricing();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Create New Bundle</h2>
        <p className="text-gray-400">Package your content together and offer it at a discounted price</p>
      </div>

      {/* Bundle Type Selection */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-xl font-semibold text-white mb-4">1. Choose Bundle Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setBundleType('COURSE')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 ${
              bundleType === 'COURSE'
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-white/20 bg-white/5 text-gray-400 hover:border-green-500/50'
            }`}
          >
            <BookOpenIcon className="w-12 h-12 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Course Bundle</h4>
            <p className="text-sm">Package multiple complete courses together</p>
          </button>

          <button
            onClick={() => setBundleType('MODULE')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 ${
              bundleType === 'MODULE'
                ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                : 'border-white/20 bg-white/5 text-gray-400 hover:border-purple-500/50'
            }`}
          >
            <FolderIcon className="w-12 h-12 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Module Bundle</h4>
            <p className="text-sm">Package individual modules from different courses</p>
          </button>
        </div>
      </div>

      {/* Bundle Details */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-xl font-semibold text-white mb-4">2. Bundle Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bundle Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bundle name"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's included in this bundle"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Discount Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Visibility</label>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isPublic
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-gray-500/20 border border-gray-500/30 text-gray-400'
                }`}
              >
                {isPublic ? <GlobeAltIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                {isPublic ? 'Public' : 'Private'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Selection */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          3. Select {bundleType === 'COURSE' ? 'Courses' : 'Modules'}
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading available {bundleType === 'COURSE' ? 'courses' : 'modules'}...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(bundleType === 'COURSE' ? availableCourses : availableModules).map((item) => {
              const isSelected = selectedItems.includes(item.id);
              const price = bundleType === 'COURSE' ? (item as Course).price : (item as Module).price;
              const isFree = bundleType === 'COURSE' ? !(item as Course).isPaid : (item as Module).isFree;
              const category = bundleType === 'COURSE' 
                ? (item as Course).category.name 
                : (item as Module).course.category.name;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemToggle(item.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          {category}
                        </span>
                        {bundleType === 'MODULE' && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {(item as Module).course.title}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`font-bold ${isFree ? 'text-green-400' : 'text-white'}`}>
                          {isFree ? 'Free' : `$${price.toFixed(2)}`}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                      }`}>
                        {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {(bundleType === 'COURSE' ? availableCourses : availableModules).length === 0 && (
              <div className="text-center py-8">
                <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  No {bundleType === 'COURSE' ? 'courses' : 'modules'} available for bundling
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pricing Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white mb-4">Pricing Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Individual Total:</span>
              <span className="text-white font-semibold">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Discount ({discount}%):</span>
              <span className="text-red-400 font-semibold">-${savings.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-lg">Bundle Price:</span>
                <span className="text-green-400 font-bold text-2xl">${finalPrice.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <p className="text-green-300 text-sm text-right">
                  Save ${savings.toFixed(2)} ({Math.round((savings / totalPrice) * 100)}% off)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      <div className="text-center">
        <button
          onClick={handleCreateBundle}
          disabled={createLoading || !name.trim() || selectedItems.length === 0}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
        >
          {createLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating Bundle...
            </>
          ) : (
            <>
              <PlusIcon className="w-6 h-6" />
              Create Bundle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
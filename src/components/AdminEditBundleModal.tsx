// frontend/src/components/AdminEditBundleModal.tsx
"use client";

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  FolderIcon,
  GlobeAltIcon,
  LockClosedIcon,
  StarIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'COURSE' | 'MODULE';
  totalPrice: number;
  finalPrice: number;
  discount: number;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isPublic: boolean;
  salesCount: number;
  revenue: number;
  viewCount: number;
  totalItems: number;
  courseItems?: Array<{
    course: {
      id: number;
      title: string;
      price: number;
      isPaid: boolean;
      category: { name: string };
    };
  }>;
  moduleItems?: Array<{
    module: {
      id: number;
      title: string;
      price: number;
      isFree: boolean;
      course: { title: string; category: { name: string } };
    };
  }>;
}

interface Course {
  id: number;
  title: string;
  price: number;
  isPaid: boolean;
  category: { name: string };
}

interface Module {
  id: number;
  title: string;
  price: number;
  isFree: boolean;
  course: {
    title: string;
    category: { name: string };
  };
}

interface Props {
  bundle: Bundle;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AdminEditBundleModal({ bundle, isOpen, onClose, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState(bundle.name);
  const [description, setDescription] = useState(bundle.description || '');
  const [discount, setDiscount] = useState(bundle.discount);
  const [isActive, setIsActive] = useState(bundle.isActive);
  const [isPublic, setIsPublic] = useState(bundle.isPublic);
  const [isFeatured, setIsFeatured] = useState(bundle.isFeatured);
  
  // Items state
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [availableItems, setAvailableItems] = useState<Course[] | Module[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset form state when modal opens
      setName(bundle.name);
      setDescription(bundle.description || '');
      setDiscount(bundle.discount);
      setIsActive(bundle.isActive);
      setIsPublic(bundle.isPublic);
      setIsFeatured(bundle.isFeatured);
      
      // Set selected items
      if (bundle.type === 'COURSE' && bundle.courseItems) {
        setSelectedItems(bundle.courseItems.map(item => item.course.id));
      } else if (bundle.type === 'MODULE' && bundle.moduleItems) {
        setSelectedItems(bundle.moduleItems.map(item => item.module.id));
      }
      
      // Fetch available items
      fetchAvailableItems();
    }
  }, [isOpen, bundle]);

  const fetchAvailableItems = async () => {
    try {
      setLoading(true);
      const endpoint = bundle.type === 'COURSE' ? 'courses' : 'modules';
      const response = await fetch(`http://localhost:5000/api/bundles/items/${endpoint}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableItems(bundle.type === 'COURSE' ? data.courses : data.modules);
      } else {
        toast.error(`Failed to load available ${bundle.type.toLowerCase()}s`);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
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
    
    if (bundle.type === 'COURSE') {
      const courses = availableItems as Course[];
      const selectedCourses = courses.filter(course => selectedItems.includes(course.id));
      totalPrice = selectedCourses.reduce((sum, course) => sum + (course.isPaid ? course.price : 0), 0);
    } else {
      const modules = availableItems as Module[];
      const selectedModules = modules.filter(module => selectedItems.includes(module.id));
      totalPrice = selectedModules.reduce((sum, module) => sum + (!module.isFree ? module.price : 0), 0);
    }
    
    const finalPrice = totalPrice * (1 - discount / 100);
    const savings = totalPrice - finalPrice;
    
    return { totalPrice, finalPrice, savings };
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Bundle name is required');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error(`Please select at least one ${bundle.type.toLowerCase()}`);
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch(`http://localhost:5000/api/admin/bundles/${bundle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          discount,
          isActive,
          isPublic,
          isFeatured,
          itemIds: selectedItems,
          type: bundle.type
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bundle updated successfully!');
        onUpdate();
        onClose();
      } else {
        toast.error(data.error || 'Failed to update bundle');
      }
    } catch (error) {
      console.error('Error updating bundle:', error);
      toast.error('Failed to update bundle');
    } finally {
      setSaving(false);
    }
  };

  const { totalPrice, finalPrice, savings } = calculatePricing();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0b14] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Edit Bundle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-8">
            {/* Basic Details */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Bundle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bundle Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Settings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Status Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Active</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Public</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">Featured</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Bundle Items */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Bundle {bundle.type === 'COURSE' ? 'Courses' : 'Modules'} ({selectedItems.length})
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading available items...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableItems.map((item) => {
                    const isSelected = selectedItems.includes(item.id);
                    const price = bundle.type === 'COURSE' ? (item as Course).price : (item as Module).price;
                    const isFree = bundle.type === 'COURSE' ? !(item as Course).isPaid : (item as Module).isFree;
                    const category = bundle.type === 'COURSE' 
                      ? (item as Course).category.name 
                      : (item as Module).course.category.name;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemToggle(item.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 bg-white/5 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white text-sm">{item.title}</h4>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                {category}
                              </span>
                              {bundle.type === 'MODULE' && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                  {(item as Module).course.title}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm ${isFree ? 'text-green-400' : 'text-white'}`}>
                              {isFree ? 'Free' : `$${price.toFixed(2)}`}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                            }`}>
                              {isSelected && <CheckCircleIcon className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pricing Summary */}
            {selectedItems.length > 0 && (
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Updated Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Individual Total:</span>
                    <span className="text-white font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Discount ({discount}%):</span>
                    <span className="text-red-400 font-semibold">-${savings.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">New Bundle Price:</span>
                      <span className="text-green-400 font-bold text-xl">${finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || selectedItems.length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Update Bundle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
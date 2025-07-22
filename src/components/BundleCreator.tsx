// frontend/src/components/BundleCreator.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ShoppingBagIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Module {
  id: number;
  title: string;
  price: number;
  duration?: number;
  course: {
    id: number;
    title: string;
  };
}

interface BundleCreatorProps {
  onBundleCreated?: () => void;
  className?: string;
}

export default function BundleCreator({ onBundleCreated, className = "" }: BundleCreatorProps) {
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundleDescription, setBundleDescription] = useState('');
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    if (showCreator) {
      fetchAvailableModules();
    }
  }, [showCreator]);

  useEffect(() => {
    // Filter modules based on search term
    const filtered = availableModules.filter(module =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModules(filtered);
  }, [availableModules, searchTerm]);

  const fetchAvailableModules = async () => {
    setLoadingModules(true);
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const courses = await response.json();
        const modules = courses.flatMap((course: any) => 
          course.modules
            ?.filter((module: any) => module.price > 0 && module.isPublished) // Only paid & published modules
            .map((module: any) => ({
              ...module,
              course: { id: course.id, title: course.title }
            })) || []
        );
        
        setAvailableModules(modules);
        setFilteredModules(modules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoadingModules(false);
    }
  };

  const toggleModuleSelection = (moduleId: number) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const calculatePricing = () => {
    const totalPrice = selectedModules.reduce((sum, moduleId) => {
      const module = availableModules.find(m => m.id === moduleId);
      return sum + (module?.price || 0);
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
    
    if (selectedModules.length === 0) {
      toast.error('Please select at least one module');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/payment/bundles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bundleName,
          description: bundleDescription,
          moduleIds: selectedModules,
          discount
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bundle created successfully! 🎉');
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
    setSelectedModules([]);
    setDiscount(0);
    setSearchTerm('');
  };

  const { totalPrice, discountAmount, finalPrice } = calculatePricing();

  if (!showCreator) {
    return (
      <button
        onClick={() => setShowCreator(true)}
        className={`w-full p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center justify-center gap-3 group ${className}`}
      >
        <PlusIcon className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
        <span className="text-lg font-semibold text-white">Create New Module Bundle</span>
      </button>
    );
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Create Module Bundle</h3>
          <p className="text-gray-400">Select modules and create your custom learning package</p>
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
              placeholder="e.g., Frontend Development Mastery"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Description (Optional)
            </label>
            <textarea
              value={bundleDescription}
              onChange={(e) => setBundleDescription(e.target.value)}
              placeholder="Describe what this bundle includes and who it's for..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
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
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                min="0"
                max="100"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <span className="absolute right-3 top-3 text-gray-400">%</span>
            </div>
          </div>

          {/* Pricing Preview */}
          {selectedModules.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CalculatorIcon className="w-4 h-4" />
                Pricing Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Modules ({selectedModules.length}):</span>
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

      {/* Module Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-white">
            Select Modules ({selectedModules.length} selected)
          </h4>
          
          {/* Search */}
          <div className="relative w-64">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Module List */}
        <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
          {loadingModules ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {searchTerm ? 'No modules match your search' : 'No modules available'}
            </div>
          ) : (
            filteredModules.map((module) => (
              <div
                key={module.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                  selectedModules.includes(module.id)
                    ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => toggleModuleSelection(module.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-white mb-1">{module.title}</h5>
                    <p className="text-sm text-gray-400 mb-2">{module.course.title}</p>
                    {module.duration && (
                      <div className="text-xs text-gray-500">
                        {module.duration} minutes
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-white mb-2">
                      ${module.price}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedModules.includes(module.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-400 hover:border-blue-400'
                    }`}>
                      {selectedModules.includes(module.id) && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
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
          disabled={loading || !bundleName.trim() || selectedModules.length === 0}
          className="flex-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-48"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating Bundle...
            </>
          ) : (
            <>
              <ShoppingBagIcon className="w-5 h-5" />
              Create Bundle
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
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
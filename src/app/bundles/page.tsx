// frontend/src/app/bundles/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  PlusIcon,
  MinusIcon,
  PlayIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Module {
  id: number;
  title: string;
  content?: string;
  type: 'TEXT' | 'VIDEO';
  price: number;
  isFree: boolean;
  isPublished: boolean;
  duration?: number;
  videoDuration?: number;
  orderIndex: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: {
    name: string;
  };
  modules: Module[];
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  totalPrice: number;
  finalPrice: number;
  isPurchased: boolean;
  isActive: boolean;
  items: Array<{
    module: {
      id: number;
      title: string;
      price: number;
      duration?: number;
      course: {
        title: string;
      };
    };
  }>;
  createdAt: string;
}

interface SelectedModule {
  moduleId: number;
  module: Module;
  courseTitle: string;
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'my-bundles' | 'create-bundle'>('my-bundles');
  
  // Bundle creation state
  const [selectedModules, setSelectedModules] = useState<SelectedModule[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundleDescription, setBundleDescription] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<number[]>([]);
  const [creatingBundle, setCreatingBundle] = useState(false);

  useEffect(() => {
    fetchBundles();
    if (activeTab === 'create-bundle') {
      fetchCourses();
    }
  }, [activeTab]);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/payment/bundles', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBundles(data);
      } else {
        toast.error('Failed to load bundles');
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await fetch('http://localhost:5000/api/courses', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📚 All courses received:', data);
        
        // Filter courses that have paid modules
        const coursesWithPaidModules = data.filter((course: Course) => 
          course.modules && course.modules.some(module => module.price > 0 && module.isPublished)
        );
        
        console.log('✅ Courses with paid modules:', coursesWithPaidModules);
        setCourses(coursesWithPaidModules);
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Something went wrong');
    } finally {
      setCoursesLoading(false);
    }
  };

  const toggleCourse = (courseId: number) => {
    setExpandedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleModuleSelection = (module: Module, courseTitle: string) => {
    const moduleId = module.id;
    const isSelected = selectedModules.some(item => item.moduleId === moduleId);
    
    if (isSelected) {
      setSelectedModules(prev => prev.filter(item => item.moduleId !== moduleId));
      toast.success('Module removed from bundle');
    } else {
      setSelectedModules(prev => [...prev, { moduleId, module, courseTitle }]);
      toast.success('Module added to bundle');
    }
  };

  const calculateBundlePricing = () => {
    const total = selectedModules.reduce((sum, item) => sum + item.module.price, 0);
    
    return {
      total,
      moduleCount: selectedModules.length
    };
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

    setCreatingBundle(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/payment/bundles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bundleName,
          description: bundleDescription,
          moduleIds: selectedModules.map(item => item.moduleId)
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bundle created successfully! 🎉');
        // Reset form
        setBundleName('');
        setBundleDescription('');
        setSelectedModules([]);
        // Switch to bundles tab and refresh
        setActiveTab('my-bundles');
        fetchBundles();
      } else {
        toast.error(data.error || 'Failed to create bundle');
      }
    } catch (error) {
      console.error('Error creating bundle:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setCreatingBundle(false);
    }
  };

  const handlePurchaseBundle = async (bundleId: number) => {
    setPurchaseLoading(bundleId);
    
    try {
      const response = await fetch('http://localhost:5000/api/payment/bundles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Something went wrong');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleDeleteBundle = async (bundleId: number) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/payment/bundles/${bundleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Bundle deleted successfully');
        fetchBundles();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete bundle');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Something went wrong');
    }
  };

  const pricing = calculateBundlePricing();

  if (loading && activeTab === 'my-bundles') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading bundles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Module Bundles</h1>
          <p className="text-gray-400 text-lg">Create custom learning packages by combining multiple modules</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('my-bundles')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'my-bundles'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            My Bundles ({bundles.length})
          </button>
          <button
            onClick={() => setActiveTab('create-bundle')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'create-bundle'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Create Bundle
          </button>
        </div>

        {/* Content */}
        {activeTab === 'my-bundles' ? (
          /* My Bundles Tab */
          <div className="space-y-8">
            {bundles.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
                  <ShoppingCartIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-white mb-4">No Bundles Yet</h3>
                  <p className="text-gray-400 mb-6">Create your first module bundle to get started with custom learning packages</p>
                  <button
                    onClick={() => setActiveTab('create-bundle')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Create Your First Bundle
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    {/* Bundle Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-gray-400 text-sm leading-relaxed">{bundle.description}</p>
                        )}
                      </div>
                      {bundle.isPurchased && (
                        <div className="flex items-center gap-1 text-green-400 bg-green-500/20 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Owned</span>
                        </div>
                      )}
                    </div>

                    {/* Modules List */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <BookOpenIcon className="w-4 h-4" />
                        Modules ({bundle.items.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {bundle.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm py-1">
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-300 truncate">{item.module.title}</div>
                              <div className="text-gray-500 text-xs truncate">{item.module.course.title}</div>
                            </div>
                            <div className="text-white font-medium ml-2">${item.module.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6 p-4 bg-white/5 rounded-2xl">
                      <div className="space-y-2">
                        <div className="flex justify-between text-lg font-bold text-white">
                          <span>Total Price:</span>
                          <span>${bundle.finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      {bundle.isPurchased ? (
                        <div className="flex items-center justify-center p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl font-medium">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          Bundle Purchased
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePurchaseBundle(bundle.id)}
                          disabled={purchaseLoading === bundle.id}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {purchaseLoading === bundle.id ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShoppingCartIcon className="w-5 h-5" />
                              Purchase Bundle - ${bundle.finalPrice.toFixed(2)}
                            </>
                          )}
                        </button>
                      )}
                      
                      {!bundle.isPurchased && (
                        <button
                          onClick={() => handleDeleteBundle(bundle.id)}
                          className="w-full py-2 bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete Bundle
                        </button>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3" />
                      <span>Created {new Date(bundle.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Create Bundle Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Select Modules from Courses</h3>
                
                {coursesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No courses with paid modules available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => {
                      const isExpanded = expandedCourses.includes(course.id);
                      const paidModules = course.modules.filter(m => m.price > 0 && m.isPublished);
                      
                      return (
                        <div key={course.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleCourse(course.id)}
                            className="w-full p-4 text-left hover:bg-white/10 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              {course.imageUrl && (
                                <img 
                                  src={course.imageUrl} 
                                  alt={course.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h4 className="font-semibold text-white">{course.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span>{paidModules.length} paid modules</span>
                                  <span>{course.category.name}</span>
                                  <span>Course price: ${course.price}</span>
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          
                          {isExpanded && (
                            <div className="border-t border-white/10 p-4 bg-white/5">
                              <div className="space-y-3">
                                {paidModules.map((module) => {
                                  const isSelected = selectedModules.some(item => item.moduleId === module.id);
                                  
                                  return (
                                    <div
                                      key={module.id}
                                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-blue-500/20 border-blue-500/50'
                                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                                      }`}
                                      onClick={() => toggleModuleSelection(module, course.title)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                                          }`}>
                                            {isSelected && <span className="text-white text-sm">✓</span>}
                                          </div>
                                          <div>
                                            <h5 className="font-medium text-white">{module.title}</h5>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                              <span className={`px-2 py-1 rounded ${
                                                module.type === 'VIDEO' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                              }`}>
                                                {module.type}
                                              </span>
                                              {module.videoDuration && (
                                                <span>{Math.floor(module.videoDuration / 60)}m</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-lg font-semibold text-white">${module.price}</div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bundle Creation Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl sticky top-6">
                <h3 className="text-lg font-bold text-white mb-4">Create Bundle</h3>
                
                {/* Bundle Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bundle Name</label>
                    <input
                      type="text"
                      value={bundleName}
                      onChange={(e) => setBundleName(e.target.value)}
                      placeholder="e.g., Frontend Development Bundle"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                    <textarea
                      value={bundleDescription}
                      onChange={(e) => setBundleDescription(e.target.value)}
                      placeholder="Describe your bundle..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Selected Modules */}
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-3">Selected Modules ({selectedModules.length})</h4>
                  {selectedModules.length === 0 ? (
                    <p className="text-gray-400 text-sm">No modules selected</p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                      {selectedModules.map((item) => (
                        <div key={item.moduleId} className="flex items-center justify-between text-sm">
                          <div className="flex-1 min-w-0">
                            <div className="text-white truncate">{item.module.title}</div>
                            <div className="text-gray-500 text-xs truncate">{item.courseTitle}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">${item.module.price}</span>
                            <button
                              onClick={() => toggleModuleSelection(item.module, item.courseTitle)}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Summary */}
                {selectedModules.length > 0 && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-white mb-3">Pricing Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-lg font-bold text-white">
                        <span>Total ({pricing.moduleCount} modules):</span>
                        <span>${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Create Button */}
                <button
                  onClick={handleCreateBundle}
                  disabled={creatingBundle || selectedModules.length === 0 || !bundleName.trim()}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingBundle ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Bundle...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      Create Bundle
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
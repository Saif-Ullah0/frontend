// frontend/src/app/courses/[id]/modules-shop/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Play, 
  Lock, 
  CheckCircle2,
  Clock,
  Video,
  FileText,
  Package,
  CreditCard,
  Tag,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

interface Module {
  id: number;
  title: string;
  content?: string;
  type: 'TEXT' | 'VIDEO';
  duration?: number;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  isOwned?: boolean;
  orderIndex: number;
  videoDuration?: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  category?: {
    name: string;
  };
  modules: Module[];
}

interface CartItem {
  moduleId: number;
  module: Module;
}

export default function ModuleShopPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleOwnership, setModuleOwnership] = useState<{[key: number]: boolean}>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [bundleDiscount, setBundleDiscount] = useState(10); // Default 10% discount for multiple modules

  useEffect(() => {
    fetchCourseAndOwnership();
  }, [id]);

  const fetchCourseAndOwnership = async () => {
    try {
      setLoading(true);
      
      // Fetch course data
      const courseResponse = await fetch(`http://localhost:5000/api/courses/${id}`, {
        credentials: 'include'
      });

      if (!courseResponse.ok) {
        throw new Error('Course not found');
      }

      const courseData = await courseResponse.json();
      setCourse(courseData);

      // Fetch module ownership
      if (courseData.modules) {
        const ownership: {[key: number]: boolean} = {};
        
        await Promise.all(
          courseData.modules.map(async (module: Module) => {
            try {
              const response = await fetch(`http://localhost:5000/api/payment/modules/${module.id}`, {
                credentials: 'include'
              });
              
              if (response.ok) {
                const data = await response.json();
                ownership[module.id] = data.isOwned || false;
              } else {
                ownership[module.id] = false;
              }
            } catch {
              ownership[module.id] = false;
            }
          })
        );
        
        setModuleOwnership(ownership);
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (module: Module) => {
    if (cart.find(item => item.moduleId === module.id)) {
      toast.error('Module already in cart');
      return;
    }
    
    setCart(prev => [...prev, { moduleId: module.id, module }]);
    toast.success('Module added to cart');
  };

  const removeFromCart = (moduleId: number) => {
    setCart(prev => prev.filter(item => item.moduleId !== moduleId));
    toast.success('Module removed from cart');
  };

  const calculatePricing = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.module.price, 0);
    const isBundle = cart.length > 1;
    const discountAmount = isBundle ? (subtotal * bundleDiscount) / 100 : 0;
    const total = subtotal - discountAmount;
    
    return {
      subtotal,
      discountAmount,
      total,
      isBundle
    };
  };

  const handlePurchase = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setPurchasing(true);

    try {
      if (cart.length === 1) {
        // Single module purchase
        const response = await fetch('http://localhost:5000/api/payment/modules/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId: cart[0].moduleId }),
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          } else if (data.success) {
            toast.success(data.message);
            fetchCourseAndOwnership(); // Refresh ownership
            setCart([]);
          }
        } else {
          toast.error(data.error || 'Purchase failed');
        }
      } else {
        // Create and purchase bundle
        const bundleName = `${course?.title} - Custom Bundle`;
        const moduleIds = cart.map(item => item.moduleId);

        // Create bundle
        const createResponse = await fetch('http://localhost:5000/api/payment/bundles/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: bundleName,
            description: `Custom bundle with ${cart.length} modules`,
            moduleIds,
            discount: bundleDiscount
          }),
          credentials: 'include'
        });

        if (!createResponse.ok) {
          const createData = await createResponse.json();
          throw new Error(createData.error || 'Failed to create bundle');
        }

        const bundleData = await createResponse.json();

        // Purchase bundle
        const purchaseResponse = await fetch('http://localhost:5000/api/payment/bundles/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bundleId: bundleData.bundle.id }),
          credentials: 'include'
        });

        const purchaseData = await purchaseResponse.json();

        if (purchaseResponse.ok && purchaseData.checkoutUrl) {
          window.location.href = purchaseData.checkoutUrl;
        } else {
          throw new Error(purchaseData.error || 'Bundle purchase failed');
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleAccessModule = (moduleId: number) => {
    router.push(`/courses/${id}/modules`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span>Loading modules...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ {error || 'Course not found'}</div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const availableModules = course.modules.filter(m => m.isPublished);
  const paidModules = availableModules.filter(m => !m.isFree && m.price > 0);
  const freeModules = availableModules.filter(m => m.isFree || m.price === 0);
  const ownedCount = Object.values(moduleOwnership).filter(Boolean).length;
  const pricing = calculatePricing();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[150px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15 blur-[120px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/courses/${id}`)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-white">{course.title} - Module Shop</h1>
                  <p className="text-gray-400 text-sm">{course.category?.name}</p>
                </div>
              </div>
              
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  cart.length > 0 
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' 
                    : 'bg-white/10 border border-white/20 text-gray-400'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Overview */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Choose Your Learning Path</h2>
                <p className="text-gray-400 mb-6">{course.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{availableModules.length}</div>
                    <div className="text-gray-400">Total Modules</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{freeModules.length}</div>
                    <div className="text-gray-400">Free Modules</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{ownedCount}</div>
                    <div className="text-gray-400">Modules Owned</div>
                  </div>
                </div>
              </div>

              {/* Free Modules */}
              {freeModules.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Free Modules ({freeModules.length})
                  </h3>
                  <div className="space-y-3">
                    {freeModules.map((module) => (
                      <div key={module.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                              {module.type === 'VIDEO' ? (
                                <Video className="w-5 h-5 text-green-400" />
                              ) : (
                                <FileText className="w-5 h-5 text-green-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{module.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                  Free
                                </span>
                                {module.videoDuration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {Math.floor(module.videoDuration / 60)}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAccessModule(module.id)}
                            className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <Play className="w-4 h-4 inline mr-2" />
                            Access
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paid Modules */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-400" />
                  Premium Modules ({paidModules.length})
                </h3>
                <div className="space-y-3">
                  {paidModules.map((module) => {
                    const isOwned = moduleOwnership[module.id];
                    const inCart = cart.find(item => item.moduleId === module.id);
                    
                    return (
                      <div key={module.id} className={`border rounded-xl p-4 transition-all ${
                        isOwned ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isOwned ? 'bg-blue-500/20' : 'bg-orange-500/20'
                            }`}>
                              {isOwned ? (
                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                              ) : module.type === 'VIDEO' ? (
                                <Video className="w-5 h-5 text-orange-400" />
                              ) : (
                                <FileText className="w-5 h-5 text-orange-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{module.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  isOwned ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                  {isOwned ? 'Owned' : `$${module.price}`}
                                </span>
                                {module.videoDuration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {Math.floor(module.videoDuration / 60)}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isOwned ? (
                              <button
                                onClick={() => handleAccessModule(module.id)}
                                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                              >
                                <Play className="w-4 h-4 inline mr-2" />
                                Access
                              </button>
                            ) : inCart ? (
                              <button
                                onClick={() => removeFromCart(module.id)}
                                className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                              >
                                <Minus className="w-4 h-4 inline mr-2" />
                                Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => addToCart(module)}
                                className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors"
                              >
                                <Plus className="w-4 h-4 inline mr-2" />
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar - Cart */}
            <div className="space-y-6">
              {/* Shopping Cart */}
              <div className={`bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
                showCart ? 'p-6' : 'p-4'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-400" />
                    Cart ({cart.length})
                  </h3>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setShowCart(!showCart)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {showCart ? 'Collapse' : 'Expand'}
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add modules to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {showCart && (
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.moduleId} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white text-sm">{item.module.title}</h4>
                                <p className="text-gray-400 text-xs">${item.module.price}</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.moduleId)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bundle Discount Control */}
                    {cart.length > 1 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Bundle Discount:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={bundleDiscount}
                              onChange={(e) => setBundleDiscount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                              min="0"
                              max="50"
                              className="w-12 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs text-center"
                            />
                            <span className="text-gray-400 text-xs">%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pricing Summary */}
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal:</span>
                        <span className="text-white">${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      {pricing.isBundle && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-400">Bundle Discount ({bundleDiscount}%):</span>
                          <span className="text-green-400">-${pricing.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
                        <span className="text-white">Total:</span>
                        <span className="text-white">${pricing.total.toFixed(2)}</span>
                      </div>
                      {pricing.isBundle && (
                        <div className="text-center text-xs text-green-400">
                          💰 You save ${pricing.discountAmount.toFixed(2)}!
                        </div>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {purchasing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          {cart.length === 1 ? 'Buy Module' : 'Buy Bundle'}
                        </>
                      )}
                    </button>

                    {/* Payment Security */}
                    <div className="text-center text-xs text-gray-400">
                      🔒 Secure payment via Stripe • Instant access
                    </div>
                  </div>
                )}
              </div>

              {/* Course Actions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-4">Course Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/courses/${id}/modules`)}
                    className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors text-left"
                  >
                    <span className="text-blue-300">View All Modules</span>
                  </button>
                  <button
                    onClick={() => router.push('/bundles')}
                    className="w-full p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors text-left"
                  >
                    <span className="text-purple-300">Manage Bundles</span>
                  </button>
                  <button
                    onClick={() => router.push(`/courses/${id}`)}
                    className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors text-left"
                  >
                    <span className="text-green-300">Course Overview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      `}</style>
    </main>
  );
}
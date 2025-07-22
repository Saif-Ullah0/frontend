// frontend/src/components/SimpleBundleWidget.tsx
"use client";

import { useState } from 'react';
import { ShoppingBagIcon, TagIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Module {
  id: number;
  title: string;
  price: number;
  isSelected?: boolean;
}

interface SimpleBundleWidgetProps {
  modules: Module[];
  courseTitle: string;
  onBundleCreated?: () => void;
}

export default function SimpleBundleWidget({ 
  modules, 
  courseTitle, 
  onBundleCreated 
}: SimpleBundleWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [discount, setDiscount] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filter only paid modules
  const paidModules = modules.filter(m => m.price > 0);

  const calculateTotal = () => {
    const total = selectedModules.reduce((sum, moduleId) => {
      const module = paidModules.find(m => m.id === moduleId);
      return sum + (module?.price || 0);
    }, 0);
    
    const discountAmount = (total * discount) / 100;
    return {
      total,
      discountAmount,
      final: total - discountAmount
    };
  };

  const handleCreateBundle = async () => {
    if (selectedModules.length < 2) {
      toast.error('Select at least 2 modules for a bundle');
      return;
    }

    if (!bundleName.trim()) {
      setBundleName(`${courseTitle} Bundle`);
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/payment/bundles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bundleName.trim() || `${courseTitle} Bundle`,
          description: `Custom bundle from ${courseTitle}`,
          moduleIds: selectedModules,
          discount
        }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Bundle created successfully! 🎉');
        setIsOpen(false);
        setSelectedModules([]);
        setBundleName('');
        onBundleCreated?.();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create bundle');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  if (paidModules.length < 2) {
    return null; // Don't show if not enough paid modules
  }

  const pricing = calculateTotal();

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShoppingBagIcon className="w-5 h-5 text-purple-400" />
          Create Module Bundle
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg transition-all ${
            isOpen ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <PlusIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Bundle Name */}
          <input
            type="text"
            value={bundleName}
            onChange={(e) => setBundleName(e.target.value)}
            placeholder={`${courseTitle} Bundle`}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-purple-500"
          />

          {/* Discount */}
          <div className="flex items-center gap-3">
            <TagIcon className="w-4 h-4 text-purple-400" />
            <label className="text-sm text-gray-300">Discount:</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
              min="0"
              max="50"
              className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-purple-500"
            />
            <span className="text-sm text-gray-400">%</span>
          </div>

          {/* Module Selection */}
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Select modules:</p>
            {paidModules.map(module => (
              <label
                key={module.id}
                className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedModules.includes(module.id)}
                  onChange={() => toggleModule(module.id)}
                  className="rounded border-gray-300"
                />
                <span className="flex-1 text-sm text-white">{module.title}</span>
                <span className="text-sm text-gray-400">${module.price}</span>
              </label>
            ))}
          </div>

          {/* Pricing Preview */}
          {selectedModules.length > 0 && (
            <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Total ({selectedModules.length} modules):</span>
                <span>${pricing.total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({discount}%):</span>
                  <span>-${pricing.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-1">
                <span>Final Price:</span>
                <span>${pricing.final.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreateBundle}
            disabled={loading || selectedModules.length < 2}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <ShoppingBagIcon className="w-4 h-4" />
                Create Bundle ({selectedModules.length})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
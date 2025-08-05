// frontend/src/components/BundleNavigation.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCartIcon, 
  SparklesIcon,
  PlusIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface BundleNavigationProps {
  userRole?: 'student' | 'instructor' | 'admin';
  className?: string;
}

export default function BundleNavigation({ userRole = 'student', className = "" }: BundleNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Browse Bundles',
      href: '/shop/bundles',
      icon: BuildingStorefrontIcon,
      description: 'Discover curated learning packages',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'My Bundles',
      href: '/bundles',
      icon: ShoppingCartIcon,
      description: 'Manage your bundle collection',
      roles: ['student', 'instructor', 'admin']
    },
    {
      name: 'Admin Management',
      href: '/admin/bundles',
      icon: Cog6ToothIcon,
      description: 'Bundle management dashboard',
      roles: ['admin']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const currentItem = filteredItems.find(item => pathname.startsWith(item.href));

  return (
    <div className={`relative ${className}`}>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
        >
          {currentItem ? (
            <>
              <currentItem.icon className="w-5 h-5" />
              <span>{currentItem.name}</span>
            </>
          ) : (
            <>
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Bundles</span>
            </>
          )}
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl z-50">
            <div className="p-2 space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm opacity-80">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// frontend/src/components/bundles/BundleCard.tsx
"use client";

import { 
  ShoppingCartIcon, 
  CheckCircleIcon,
  EyeIcon,
  UserGroupIcon,
  TagIcon,
  SparklesIcon,
  TrendingUpIcon,
  ClockIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface BundleCardProps {
  bundle: {
    id: number;
    name: string;
    description?: string;
    type: 'MODULE' | 'COURSE';
    totalPrice: number;
    finalPrice: number;
    discount: number;
    isPurchased?: boolean;
    isActive: boolean;
    isFeatured: boolean;
    isPopular: boolean;
    salesCount: number;
    viewCount: number;
    items?: Array<{ module: any }>;
    courseItems?: Array<{ course: any }>;
    user?: { name: string };
  };
  onPurchase?: (bundleId: number) => void;
  onDelete?: (bundleId: number) => void;
  purchaseLoading?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export default function BundleCard({ 
  bundle, 
  onPurchase, 
  onDelete,
  purchaseLoading = false,
  showActions = true,
  compact = false,
  className = ""
}: BundleCardProps) {
  const savings = bundle.totalPrice - bundle.finalPrice;
  const percentage = Math.round((savings / bundle.totalPrice) * 100);
  const itemCount = bundle.type === 'COURSE' 
    ? bundle.courseItems?.length || 0 
    : bundle.items?.length || 0;

  return (
    <div className={`bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 relative ${
      compact ? 'p-4' : 'p-6'
    } ${className}`}>
      {/* Badges */}
      <div className="absolute top-4 right-4 flex gap-2">
        {bundle.isFeatured && (
          <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
            FEATURED
          </div>
        )}
        {bundle.isPopular && (
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            POPULAR
          </div>
        )}
      </div>

      {/* Bundle Info */}
      <div className={compact ? 'mb-3' : 'mb-4'}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            bundle.type === 'COURSE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
          }`}>
            {bundle.type === 'COURSE' ? 'Course Bundle' : 'Module Bundle'}
          </span>
        </div>
        
        <h3 className={`font-bold text-white ${compact ? 'text-lg mb-1' : 'text-xl mb-2'}`}>
          {bundle.name}
        </h3>
        
        {bundle.description && !compact && (
          <p className="text-gray-300 text-sm line-clamp-2 mb-3">{bundle.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <span>{itemCount} {bundle.type === 'COURSE' ? 'courses' : 'modules'}</span>
          <div className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{bundle.salesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            <span>{bundle.viewCount}</span>
          </div>
        </div>

        {bundle.user && (
          <div className="text-xs text-gray-500">
            By {bundle.user.name}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className={compact ? 'mb-3' : 'mb-4'}>
        <div className="flex items-center gap-3 mb-2">
          <span className={`font-bold text-white ${compact ? 'text-xl' : 'text-2xl'}`}>
            ${bundle.finalPrice.toFixed(2)}
          </span>
          {savings > 0 && (
            <span className="text-gray-400 line-through">${bundle.totalPrice.toFixed(2)}</span>
          )}
        </div>
        {savings > 0 && (
          <div className="text-green-400 font-medium text-sm">
            Save ${savings.toFixed(2)} ({percentage}% off)
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="space-y-2">
          <Link
            href={`/bundles/${bundle.id}`}
            className="block w-full py-2 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors text-sm"
          >
            View Details
          </Link>
          
          {bundle.isPurchased ? (
            <div className="flex items-center justify-center p-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl font-medium text-sm">
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Purchased
            </div>
          ) : onPurchase && (
            <button
              onClick={() => onPurchase(bundle.id)}
              disabled={purchaseLoading}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {purchaseLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4" />
                  Buy Now
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// frontend/src/components/bundles/SavingsCalculator.tsx
"use client";

import { CalculatorIcon, TagIcon } from '@heroicons/react/24/outline';

interface SavingsCalculatorProps {
  originalPrice: number;
  finalPrice: number;
  itemCount: number;
  itemType: string;
  className?: string;
}

export default function SavingsCalculator({ 
  originalPrice, 
  finalPrice, 
  itemCount, 
  itemType,
  className = ""
}: SavingsCalculatorProps) {
  const savings = originalPrice - finalPrice;
  const percentage = Math.round((savings / originalPrice) * 100);

  if (savings <= 0) {
    return (
      <div className={`bg-white/5 border border-white/10 rounded-xl p-4 ${className}`}>
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <CalculatorIcon className="w-4 h-4" />
          Pricing Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>{itemType} ({itemCount}):</span>
            <span>${originalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-white border-t border-white/10 pt-2">
            <span>Total Price:</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-4 ${className}`}>
      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
        <CalculatorIcon className="w-4 h-4" />
        Pricing Summary
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-300">
          <span>{itemType} ({itemCount}):</span>
          <span>${originalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-green-400">
          <span>Discount ({percentage}%):</span>
          <span>-${savings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-white border-t border-white/10 pt-2">
          <span>Final Price:</span>
          <span>${finalPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-green-400 bg-green-500/20 rounded-lg p-2 mt-3">
          <TagIcon className="w-4 h-4" />
          <span className="font-medium">You save ${savings.toFixed(2)}!</span>
        </div>
      </div>
    </div>
  );
}

// frontend/src/components/bundles/BundleTypeSelector.tsx
"use client";

import { AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';

interface BundleTypeSelectorProps {
  selectedType: 'MODULE' | 'COURSE';
  onChange: (type: 'MODULE' | 'COURSE') => void;
  className?: string;
}

export default function BundleTypeSelector({ 
  selectedType, 
  onChange, 
  className = ""
}: BundleTypeSelectorProps) {
  const types = [
    {
      key: 'MODULE' as const,
      name: 'Module Bundle',
      description: 'Combine individual modules from different courses',
      icon: ClockIcon,
      color: 'purple'
    },
    {
      key: 'COURSE' as const,
      name: 'Course Bundle',
      description: 'Package complete courses together',
      icon: AcademicCapIcon,
      color: 'green'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.key;
        
        return (
          <button
            key={type.key}
            onClick={() => onChange(type.key)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              isSelected
                ? type.color === 'purple'
                  ? 'bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/30'
                  : 'bg-green-500/20 border-green-500 ring-2 ring-green-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                isSelected
                  ? type.color === 'purple' ? 'bg-purple-500/30' : 'bg-green-500/30'
                  : 'bg-white/10'
              }`}>
                <Icon className={`w-6 h-6 ${
                  isSelected
                    ? type.color === 'purple' ? 'text-purple-400' : 'text-green-400'
                    : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`}>
                  {type.name}
                </h3>
                <p className={`text-sm ${
                  isSelected ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {type.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
// frontend/src/app/bundles/[id]/page.tsx - CLEAN VERSION
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ClockIcon,
  AcademicCapIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import Link from 'next/link';

interface BundleItem {
  moduleId: number;
  module: {
    id: number;
    title: string;
    price: number;
    duration?: number;
    course: {
      id: number;
      title: string;
    };
  };
}

interface CourseBundleItem {
  courseId: number;
  course: {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: {
      name: string;
    };
  };
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  totalPrice: number;
  finalPrice: number;
  discount: number;
  viewCount: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  moduleItems?: BundleItem[];
  courseItems?: CourseBundleItem[];
  createdAt: string;
  individualTotal?: number;
  savings?: number;
  savingsPercentage?: number;
}

export default function BundleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bundleId = params?.id as string;

  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bundleId) {
      fetchBundleDetails();
    }
  }, [bundleId]);

  const fetchBundleDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/bundles/${bundleId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Bundle details:', data);
        setBundle(data.bundle || data);
      } else {
        console.error('❌ Failed to fetch bundle:', response.status);
        toast.error('Bundle not found');
        router.push('/bundles');
      }
    } catch (error) {
      console.error('Error fetching bundle details:', error);
      toast.error('Something went wrong');
      router.push('/bundles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading bundle details...</span>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Bundle Not Found</h1>
          <Link 
            href="/bundles"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Bundles
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = bundle.type === 'COURSE' 
    ? bundle.courseItems?.length || 0 
    : bundle.moduleItems?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/bundles"
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{bundle.name}</h1>
            <p className="text-gray-400">Bundle Details</p>
          </div>
        </div>

        {/* Bundle Info */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  bundle.type === 'COURSE' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {bundle.type === 'COURSE' ? 'Course Bundle' : 'Module Bundle'}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">{bundle.name}</h2>
              
              {bundle.description && (
                <p className="text-gray-300 leading-relaxed mb-6">{bundle.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>By {bundle.user?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4" />
                  <span>{bundle.viewCount} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>Created {new Date(bundle.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Price Info */}
            <div className="text-right">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-white">${bundle.finalPrice.toFixed(2)}</span>
                {bundle.savings && bundle.savings > 0 && (
                  <span className="text-lg text-gray-400 line-through">${bundle.totalPrice.toFixed(2)}</span>
                )}
              </div>
              
              {bundle.savings && bundle.savings > 0 && (
                <div className="text-green-400 font-medium">
                  Save ${bundle.savings.toFixed(2)} ({bundle.savingsPercentage}% off)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bundle Items */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-white mb-6">
            What's Included ({itemCount} {bundle.type === 'COURSE' ? 'courses' : 'modules'})
          </h3>
          
          <div className="space-y-4">
            {bundle.type === 'COURSE' && bundle.courseItems?.map((item) => (
              <div key={item.courseId} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                {item.course.imageUrl ? (
                  <img 
                    src={item.course.imageUrl} 
                    alt={item.course.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-8 h-8 text-green-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{item.course.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2">{item.course.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {item.course.category?.name}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-white">${item.course.price}</div>
                </div>
              </div>
            ))}
            
            {bundle.type === 'MODULE' && bundle.moduleItems?.map((item) => (
              <div key={item.moduleId} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{item.module.title}</h4>
                  <p className="text-sm text-gray-400">{item.module.course.title}</p>
                  {item.module.duration && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.module.duration} minutes
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-white">${item.module.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
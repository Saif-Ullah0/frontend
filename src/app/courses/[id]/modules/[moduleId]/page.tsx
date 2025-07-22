// frontend/src/app/courses/[id]/modules/[moduleId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PlayIcon,
  ClockIcon,
  BookOpenIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import ModulePurchase from '@/components/ModulePurchase';
import { toast } from 'sonner';

interface Module {
  id: number;
  title: string;
  content?: string;
  price: number;
  duration?: number;
  isFree: boolean;
  isPublished: boolean;
  videoUrl?: string;
  course: {
    id: number;
    title: string;
  };
}

interface ModulePageData {
  module: Module;
  isOwned: boolean;
  canPurchase: boolean;
}

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  
  const [moduleData, setModuleData] = useState<ModulePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModuleData();
  }, [moduleId]);

  const fetchModuleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/payment/modules/${moduleId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setModuleData(data);

    } catch (err: unknown) {
      console.error('Error fetching module data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load module';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = () => {
    // Refresh module data after successful purchase
    fetchModuleData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white">Loading module...</span>
        </div>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-400 mb-4">⚠️ {error || 'Module not found'}</div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { module, isOwned, canPurchase } = moduleData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e]">
      {/* Background Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-[160px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-[140px] rounded-full animate-pulse-slower"></div>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 group"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-white">{module.title}</h1>
                <p className="text-gray-400 text-sm">{module.course.title}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {module.duration && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{module.duration} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BookOpenIcon className="w-4 h-4" />
                  <span>Module</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Module Content */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-6">{module.title}</h2>
                
                {/* Video Player or Content */}
                {isOwned ? (
                  <div className="space-y-6">
                    {module.videoUrl ? (
                      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                        <video
                          controls
                          className="w-full h-full"
                          poster={module.thumbnailUrl}
                        >
                          <source src={module.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <PlayIcon className="w-16 h-16 text-white/60 mx-auto mb-4" />
                          <p className="text-white/60">Content will be available soon</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Module Content */}
                    {module.content && (
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {module.content}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Locked Content Preview */}
                    <div className="relative aspect-video bg-black/20 rounded-xl overflow-hidden border border-white/10">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="text-center">
                          <LockClosedIcon className="w-16 h-16 text-white/60 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">Content Locked</h3>
                          <p className="text-gray-400">Purchase this module to access the content</p>
                        </div>
                      </div>
                      {/* Background preview (blurred) */}
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-sm"></div>
                    </div>

                    {/* Content Preview */}
                    {module.content && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                        <div className="text-gray-300 leading-relaxed opacity-50 max-h-32 overflow-hidden">
                          {module.content.substring(0, 200)}...
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 text-center py-4 z-20">
                          <p className="text-sm text-gray-400">Purchase to read full content</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Module Info */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white mb-4">About This Module</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white ml-2">{module.duration || 'N/A'} minutes</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white ml-2">
                      {module.videoUrl ? 'Video' : 'Text'} Content
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Course:</span>
                    <span className="text-white ml-2">{module.course.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white ml-2">
                      {module.isFree || module.price === 0 ? 'Free' : `${module.price}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Purchase Component */}
              <div className="sticky top-24">
                <ModulePurchase
                  module={module}
                  isOwned={isOwned}
                  canPurchase={canPurchase}
                  onPurchaseSuccess={handlePurchaseSuccess}
                />
              </div>

              {/* Learning Path */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Part of Course</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <h4 className="font-medium text-white">{module.course.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">Complete course series</p>
                  </div>
                  <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    View Full Course
                  </button>
                </div>
              </div>

              {/* Features */}
              {isOwned && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">What You Get</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Lifetime access to content
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Mobile and desktop compatible
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Progress tracking
                    </div>
                    {module.videoUrl && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        HD video content
                      </div>
                    )}
                  </div>
                </div>
              )}
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
    </div>
  );
}
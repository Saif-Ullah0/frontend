// frontend/src/lib/bundleApi.ts - Centralized API client with error handling
class BundleApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'BundleApiError';
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

class BundleApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5000/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new BundleApiError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof BundleApiError) {
        throw error;
      }
      
      // Network or parsing error
      throw new BundleApiError(
        'Network error or server unavailable',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // Bundle operations
  async getBundles(params?: Record<string, string>) {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    return this.request(`/bundles${queryString}`);
  }

  async getBundle(id: number) {
    return this.request(`/bundles/${id}`);
  }

  async createModuleBundle(data: {
    name: string;
    description?: string;
    moduleIds: number[];
    discount?: number;
  }) {
    return this.request('/bundles/create/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createCourseBundle(data: {
    name: string;
    description?: string;
    courseIds: number[];
    discount?: number;
  }) {
    return this.request('/bundles/create/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async purchaseBundle(bundleId: number) {
    return this.request('/bundles/purchase', {
      method: 'POST',
      body: JSON.stringify({ bundleId }),
    });
  }

  async deleteBundle(id: number) {
    return this.request(`/bundles/${id}`, {
      method: 'DELETE',
    });
  }

  async trackBundleView(id: number) {
    return this.request(`/bundles/${id}/view`, {
      method: 'POST',
    });
  }

  // User operations
  async getMyBundles() {
    return this.request('/bundles/my/bundles');
  }

  async getMyAnalytics() {
    return this.request('/bundles/my/analytics');
  }

  // Admin operations
  async getAdminBundles() {
    return this.request('/admin/bundles');
  }

  async getAdminAnalytics() {
    return this.request('/admin/bundles/analytics');
  }

  async toggleBundleFeatured(id: number, isFeatured: boolean) {
    return this.request(`/admin/bundles/${id}/featured`, {
      method: 'PUT',
      body: JSON.stringify({ isFeatured }),
    });
  }

  async toggleBundleStatus(id: number, isActive: boolean) {
    return this.request(`/admin/bundles/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async updatePopularBundles() {
    return this.request('/admin/bundles/update-popular', {
      method: 'POST',
    });
  }
}

// Create singleton instance
export const bundleApi = new BundleApiClient();
export { BundleApiError };

// frontend/src/components/bundles/BundleErrorBoundary.tsx
"use client";

import { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class BundleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Bundle Error Boundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-white/5 border border-red-500/30 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-gray-400 mb-6">
            We encountered an error while loading the bundle content. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh Page
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-xs text-red-300 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// frontend/src/hooks/useBundleOperations.ts
"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { bundleApi, BundleApiError } from '../lib/bundleApi';

export function useBundleOperations() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setOperationLoading = useCallback((operation: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [operation]: isLoading }));
  }, []);

  const handleApiError = useCallback((error: unknown, operation: string) => {
    console.error(`Bundle ${operation} error:`, error);
    
    if (error instanceof BundleApiError) {
      switch (error.code) {
        case 'UNAUTHORIZED':
          toast.error('Please log in to continue');
          break;
        case 'FORBIDDEN':
          toast.error('You don\'t have permission to perform this action');
          break;
        case 'NOT_FOUND':
          toast.error('Bundle not found');
          break;
        case 'VALIDATION_ERROR':
          toast.error(`Validation failed: ${error.message}`);
          break;
        case 'NETWORK_ERROR':
          toast.error('Network error. Please check your connection.');
          break;
        default:
          toast.error(error.message || `Failed to ${operation}`);
      }
    } else {
      toast.error(`An unexpected error occurred during ${operation}`);
    }
  }, []);

  const createModuleBundle = useCallback(async (data: {
    name: string;
    description?: string;
    moduleIds: number[];
    discount?: number;
  }) => {
    const operationKey = 'createModuleBundle';
    setOperationLoading(operationKey, true);

    try {
      const result = await bundleApi.createModuleBundle(data);
      toast.success('Module bundle created successfully! 🎉');
      return result;
    } catch (error) {
      handleApiError(error, 'create module bundle');
      throw error;
    } finally {
      setOperationLoading(operationKey, false);
    }
  }, [handleApiError, setOperationLoading]);

  const createCourseBundle = useCallback(async (data: {
    name: string;
    description?: string;
    courseIds: number[];
    discount?: number;
  }) => {
    const operationKey = 'createCourseBundle';
    setOperationLoading(operationKey, true);

    try {
      const result = await bundleApi.createCourseBundle(data);
      toast.success('Course bundle created successfully! 🎉');
      return result;
    } catch (error) {
      handleApiError(error, 'create course bundle');
      throw error;
    } finally {
      setOperationLoading(operationKey, false);
    }
  }, [handleApiError, setOperationLoading]);

  const purchaseBundle = useCallback(async (bundleId: number) => {
    const operationKey = `purchaseBundle-${bundleId}`;
    setOperationLoading(operationKey, true);

    try {
      const result = await bundleApi.purchaseBundle(bundleId);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
      return result;
    } catch (error) {
      handleApiError(error, 'purchase bundle');
      throw error;
    } finally {
      setOperationLoading(operationKey, false);
    }
  }, [handleApiError, setOperationLoading]);

  const deleteBundle = useCallback(async (bundleId: number) => {
    if (!confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
      return;
    }

    const operationKey = `deleteBundle-${bundleId}`;
    setOperationLoading(operationKey, true);

    try {
      await bundleApi.deleteBundle(bundleId);
      toast.success('Bundle deleted successfully');
      return true;
    } catch (error) {
      handleApiError(error, 'delete bundle');
      throw error;
    } finally {
      setOperationLoading(operationKey, false);
    }
  }, [handleApiError, setOperationLoading]);

  const toggleBundleFeatured = useCallback(async (bundleId: number, isFeatured: boolean) => {
    const operationKey = `toggleFeatured-${bundleId}`;
    setOperationLoading(operationKey, true);

    try {
      await bundleApi.toggleBundleFeatured(bundleId, isFeatured);
      toast.success(`Bundle ${isFeatured ? 'featured' : 'unfeatured'} successfully`);
      return true;
    } catch (error) {
      handleApiError(error, 'update featured status');
      throw error;
    } finally {
      setOperationLoading(operationKey, false);
    }
  }, [handleApiError, setOperationLoading]);

  const toggleBundleStatus = useCallback(async (bundleId: number, isActive: boolean) => {
    const operationKey = `toggleStatus-${bundleId}`;
    setOperationLoading(operationKey, true);

    try {
      await bundleApi.toggleBundleStatus(bundleId, isActive);
      toast.success(`Bundle ${isActive ? 'activated' : 'deactivated'} successfully`);
      return true;
    } catch (error) {
      handleApiError(error, 'update bundle status');
      throw error;
    } finally {
      setOperationLoading(operationKey, false);
    }
  }, [handleApiError, setOperationLoading]);

  return {
    loading,
    createModuleBundle,
    createCourseBundle,
    purchaseBundle,
    deleteBundle,
    toggleBundleFeatured,
    toggleBundleStatus
  };
}

// frontend/src/components/bundles/BundleTestUtils.tsx (for development/testing)
"use client";

import { useState } from 'react';
import { 
  BeakerIcon, 
  PlayIcon, 
  CheckIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

export function BundleTestUtils() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const runTests = async () => {
    setRunning(true);
    setTests([]);

    const testSuite = [
      {
        name: 'API Connection Test',
        test: async () => {
          const response = await fetch('http://localhost:5000/api/bundles', {
            credentials: 'include'
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return 'API connection successful';
        }
      },
      {
        name: 'Bundle Search Test',
        test: async () => {
          const response = await fetch('http://localhost:5000/api/bundles?search=test', {
            credentials: 'include'
          });
          if (!response.ok) throw new Error(`Search failed with ${response.status}`);
          const data = await response.json();
          return `Search returned ${Array.isArray(data) ? data.length : 0} results`;
        }
      },
      {
        name: 'Bundle Filtering Test',
        test: async () => {
          const response = await fetch('http://localhost:5000/api/bundles?type=MODULE&featured=true', {
            credentials: 'include'
          });
          if (!response.ok) throw new Error(`Filter failed with ${response.status}`);
          return 'Filtering working correctly';
        }
      },
      {
        name: 'Analytics Endpoint Test',
        test: async () => {
          const response = await fetch('http://localhost:5000/api/bundles/my/analytics', {
            credentials: 'include'
          });
          // 401 is expected if not logged in
          if (response.status === 401) return 'Analytics endpoint accessible (auth required)';
          if (!response.ok) throw new Error(`Analytics failed with ${response.status}`);
          return 'Analytics endpoint working';
        }
      }
    ];

    for (const testCase of testSuite) {
      const startTime = Date.now();
      try {
        const message = await testCase.test();
        const duration = Date.now() - startTime;
        
        setTests(prev => [...prev, {
          name: testCase.name,
          passed: true,
          message,
          duration
        }]);
      } catch (error) {
        const duration = Date.now() - startTime;
        
        setTests(prev => [...prev, {
          name: testCase.name,
          passed: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          duration
        }]);
      }
    }

    setRunning(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <BeakerIcon className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Bundle System Tests</h3>
        </div>

        <button
          onClick={runTests}
          disabled={running}
          className="w-full mb-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {running ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Running Tests...
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              Run Tests
            </>
          )}
        </button>

        {tests.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tests.map((test, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg border ${
                  test.passed
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {test.passed ? (
                    <CheckIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <XMarkIcon className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    test.passed ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {test.name}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {test.duration}ms
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  test.passed ? 'text-green-400' : 'text-red-400'
                }`}>
                  {test.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {tests.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                Passed: {tests.filter(t => t.passed).length}/{tests.length}
              </span>
              <span>
                Total: {tests.reduce((sum, t) => sum + t.duration, 0)}ms
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// frontend/src/lib/bundleConstants.ts
export const BUNDLE_CONSTANTS = {
  // Pricing
  MAX_MODULE_BUNDLE_DISCOUNT: 100,
  MAX_COURSE_BUNDLE_DISCOUNT: 50,
  MIN_BUNDLE_PRICE: 0,
  MAX_BUNDLE_PRICE: 10000,

  // Limits
  MAX_MODULES_PER_BUNDLE: 20,
  MAX_COURSES_PER_BUNDLE: 15,
  MAX_BUNDLE_NAME_LENGTH: 100,
  MAX_BUNDLE_DESCRIPTION_LENGTH: 500,

  // Analytics
  POPULARITY_THRESHOLD: 5,
  MIN_VIEWS_FOR_TRENDING: 100,

  // UI
  BUNDLES_PER_PAGE: 12,
  SEARCH_DEBOUNCE_MS: 300,
  DEFAULT_SEARCH_LIMIT: 50,

  // Feature flags
  ENABLE_BUNDLE_RECOMMENDATIONS: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_BUNDLE_RATINGS: false, // Future feature
  ENABLE_BUNDLE_REVIEWS: false, // Future feature

  // Error messages
  ERRORS: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You don\'t have permission to perform this action.',
    BUNDLE_NOT_FOUND: 'Bundle not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    PURCHASE_FAILED: 'Purchase failed. Please try again.',
    CREATE_FAILED: 'Failed to create bundle. Please try again.',
    DELETE_FAILED: 'Failed to delete bundle. Please try again.',
  }
} as const;

// Export types for TypeScript
export type BundleType = 'MODULE' | 'COURSE';
export type SortOption = 'created' | 'sales' | 'revenue' | 'views' | 'price' | 'savings';
export type SortOrder = 'asc' | 'desc';
export type BundleStatus = 'active' | 'inactive' | 'featured' | 'popular';
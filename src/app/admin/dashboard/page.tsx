// frontend/src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStats from '@/components/admin/DashboardStats';
import RecentEnrollments from '@/components/admin/RecentEnrollments';
import AdminLayout from '@/components/admin/AdminLayout';

interface DashboardData {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentEnrollments: Array<{
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
    course: {
      id: number;
      title: string;
    };
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('🚀 Dashboard: Component mounted, fetching dashboard data...');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('🔍 Dashboard: Starting fetchDashboardData...');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Dashboard: About to fetch /api/admin/dashboard...');
      
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 Dashboard: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        console.log('❌ Dashboard: Response not ok:', response.status);
        
        if (response.status === 401) {
          console.log('❌ Dashboard: 401 Unauthorized - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          console.log('❌ Dashboard: 403 Forbidden - redirecting to home');
          router.push('/');
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('🔍 Dashboard: About to parse JSON...');
      const data = await response.json();
      console.log('🔍 Dashboard: Dashboard data received:', data);
      
      setDashboardData(data);
      console.log('✅ Dashboard: Dashboard data set successfully!');
      
    } catch (err: unknown) {
      console.error('❌ Dashboard: Error fetching dashboard data:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const errorStack = err instanceof Error ? err.stack : 'No stack trace';
      
      console.error('❌ Dashboard: Error details:', {
        message: errorMessage,
        stack: errorStack
      });
      
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      console.log('🔍 Dashboard: Setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    console.log('🔍 Dashboard: Rendering loading state...');
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    console.log('🔍 Dashboard: Rendering error state:', error);
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  console.log('🔍 Dashboard: Rendering main dashboard with data:', dashboardData);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here is your platform overview.</p>
        </div>

        {/* Stats Cards */}
        {dashboardData && (
          <DashboardStats
            totalUsers={dashboardData.totalUsers}
            totalCourses={dashboardData.totalCourses}
            totalEnrollments={dashboardData.totalEnrollments}
            totalRevenue={dashboardData.totalRevenue}
          />
        )}

        {/* Recent Enrollments */}
        {dashboardData && (
          <RecentEnrollments enrollments={dashboardData.recentEnrollments} />
        )}
      </div>
    </AdminLayout>
  );
}
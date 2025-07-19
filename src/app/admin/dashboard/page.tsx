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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDashboardData(data);
      
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading dashboard...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-400 mb-4">⚠️ {error}</div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here is your platform overview and recent activity.</p>
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

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/courses')}
              className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors text-left"
            >
              <div className="text-blue-400 font-semibold">Manage Courses</div>
              <div className="text-gray-400 text-sm mt-1">Add or edit courses</div>
            </button>
            
            <button
              onClick={() => router.push('/admin/categories')}
              className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors text-left"
            >
              <div className="text-purple-400 font-semibold">Manage Categories</div>
              <div className="text-gray-400 text-sm mt-1">Organize course topics</div>
            </button>
            
            <button
              onClick={() => router.push('/admin/users')}
              className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors text-left"
            >
              <div className="text-green-400 font-semibold">Manage Users</div>
              <div className="text-gray-400 text-sm mt-1">User administration</div>
            </button>
            
            <button
              onClick={() => router.push('/admin/modules')}
              className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl hover:bg-orange-500/30 transition-colors text-left"
            >
              <div className="text-orange-400 font-semibold">Manage Modules</div>
              <div className="text-gray-400 text-sm mt-1">Course content structure</div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
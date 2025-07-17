// frontend/src/components/admin/AdminLayout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  UserGroupIcon, 
  FolderIcon, 
  AcademicCapIcon, 
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
    VideoCameraIcon, 
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
  { name: 'Courses', href: '/admin/courses', icon: AcademicCapIcon },
  { name: 'Modules', href: '/admin/modules', icon: BookOpenIcon },
    { name: 'Videos', href: '/admin/video-test', icon: VideoCameraIcon }, // Add this line

];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('🚀 AdminLayout: Component mounted, starting auth check...');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔍 AdminLayout: Starting checkAuth function...');
    
    try {
      console.log('🔍 AdminLayout: About to fetch /api/users/me...');
      
      const response = await fetch('http://localhost:5000/api/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 AdminLayout: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        console.log('❌ AdminLayout: Response not ok:', response.status);
        
        if (response.status === 401) {
          console.log('❌ AdminLayout: 401 Unauthorized - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          console.log('❌ AdminLayout: 403 Forbidden - redirecting to home');
          router.push('/');
          return;
        }
        
        console.log('❌ AdminLayout: Other error - redirecting to login');
        router.push('/login');
        return;
      }

      console.log('🔍 AdminLayout: About to parse JSON...');
      const responseData = await response.json();
      console.log('🔍 AdminLayout: Raw response data:', responseData);
      
      const userData = responseData.user || responseData;
      console.log('🔍 AdminLayout: Extracted user data:', userData);
      
      if (!userData) {
        console.log('❌ AdminLayout: No user data found - redirecting to login');
        router.push('/login');
        return;
      }

      if (userData.role !== 'ADMIN') {
        console.log('❌ AdminLayout: User is not admin:', userData.role, '- redirecting to home');
        router.push('/');
        return;
      }

      console.log('✅ AdminLayout: Admin authentication successful!');
      console.log('✅ AdminLayout: Setting user:', userData);
      setUser(userData);
      
    } catch (error: unknown) {
      console.error('❌ AdminLayout: Auth check failed with error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      
      console.error('❌ AdminLayout: Error details:', {
        message: errorMessage,
        stack: errorStack
      });
      router.push('/login');
    } finally {
      console.log('🔍 AdminLayout: Setting loading to false');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🔍 AdminLayout: Starting logout...');
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('🔍 AdminLayout: Logout response:', response.status);
      router.push('/login');
    } catch (error) {
      console.error('❌ AdminLayout: Logout failed:', error);
    }
  };

  if (loading) {
    console.log('🔍 AdminLayout: Rendering loading state...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  console.log('🔍 AdminLayout: Rendering main layout with user:', user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-white">EduAdmin</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800 backdrop-blur-lg bg-opacity-80">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-white">EduAdmin</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-800 backdrop-blur-lg bg-opacity-80">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Header */}
        <header className="bg-white bg-opacity-10 backdrop-blur-lg shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="md:hidden">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user?.name}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
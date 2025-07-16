// frontend/src/components/admin/RecentEnrollments.tsx
"use client";

// import { formatDistanceToNow } from 'date-fns';
// Alternative implementation without external dependency
import { UserCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface Enrollment {
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
}

interface RecentEnrollmentsProps {
  enrollments: Enrollment[];
}

export default function RecentEnrollments({ enrollments }: RecentEnrollmentsProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Enrollments</h2>
        <div className="text-sm text-gray-400">
          {enrollments.length} recent enrollments
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-400">No recent enrollments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 group"
            >
              {/* User Avatar */}
              <div className="flex-shrink-0 mr-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* User & Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                    {enrollment.user.name}
                  </p>
                  <span className="text-gray-400">•</span>
                  <p className="text-sm text-gray-400 truncate">
                    {enrollment.user.email}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-300 truncate">
                    {enrollment.course.title}
                  </p>
                </div>
              </div>

              {/* Enrollment Date */}
              <div className="flex-shrink-0 text-right">
                <div className="text-sm text-gray-400">
                  {formatDate(enrollment.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {enrollments.length > 0 && (
        <div className="mt-6 text-center">
          <button className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            View All Enrollments
          </button>
        </div>
      )}
    </div>
  );
}
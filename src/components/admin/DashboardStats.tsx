// frontend/src/components/admin/DashboardStats.tsx
"use client";

import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export default function DashboardStats({ 
  totalUsers, 
  totalCourses, 
  totalEnrollments, 
  totalRevenue 
}: DashboardStatsProps) {
  const stats = [
    {
      name: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: UserGroupIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/20 to-blue-600/20'
    },
    {
      name: 'Total Courses',
      value: totalCourses.toLocaleString(),
      icon: AcademicCapIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/20 to-green-600/20'
    },
    {
      name: 'Total Enrollments',
      value: totalEnrollments.toLocaleString(),
      icon: BookOpenIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/20 to-purple-600/20'
    },
    {
      name: 'Total Revenue',
      value: `$${(totalRevenue / 100).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-500/20 to-yellow-600/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
          
          {/* Glow effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} opacity-20 blur-lg group-hover:opacity-30 transition-opacity`}></div>
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-2xl font-bold text-white group-hover:text-white transition-colors">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                {stat.name}
              </div>
            </div>
          </div>
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-all duration-300"></div>
        </div>
      ))}
    </div>
  );
}
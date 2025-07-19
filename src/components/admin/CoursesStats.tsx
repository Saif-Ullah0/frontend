// frontend/src/components/admin/CoursesStats.tsx
"use client";

import { 
  AcademicCapIcon, 
  GiftIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface CoursesStatsProps {
  totalCourses: number;
  freeCourses: number;
  paidCourses: number;
  // totalEnrollments: number; // Removed
  // totalRevenue: number;   // Removed
}

export default function CoursesStats({ 
  totalCourses, 
  freeCourses, 
  paidCourses, 
}: CoursesStatsProps) {
  

  const stats = [
    {
      name: 'Total Courses',
      value: totalCourses.toLocaleString(),
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      description: 'Active courses'
    },
    {
      name: 'Free Courses',
      value: freeCourses.toLocaleString(),
      icon: GiftIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/20 to-green-600/20',
      description: 'No cost courses'
    },
    {
      name: 'Paid Courses',
      value: paidCourses.toLocaleString(),
      icon: BanknotesIcon,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
      description: 'Premium courses'
    }
    // Removed Total Enrollments and Total Revenue entries
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid-cols-3 for 3 stats */}
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
            <div className="flex items-center justify-between">
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
              <div className="text-xs text-gray-400 mt-1">
                {stat.description}
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
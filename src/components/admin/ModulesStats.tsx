// frontend/src/components/admin/ModulesStats.tsx
"use client";

import { 
  RectangleStackIcon, 
  EyeIcon, 
  DocumentTextIcon,
  PlayCircleIcon 
} from '@heroicons/react/24/outline';

interface ModulesStatsProps {
  totalModules: number;
  publishedModules: number;
  draftModules: number;
  totalLessons: number;
}

export default function ModulesStats({ 
  totalModules, 
  publishedModules, 
  draftModules, 
  totalLessons 
}: ModulesStatsProps) {
  const stats = [
    {
      name: 'Total Modules',
      value: totalModules.toLocaleString(),
      icon: RectangleStackIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      description: 'All course modules'
    },
    {
      name: 'Published',
      value: publishedModules.toLocaleString(),
      icon: EyeIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/20 to-green-600/20',
      description: 'Live modules'
    },
    {
      name: 'Draft Modules',
      value: draftModules.toLocaleString(),
      icon: DocumentTextIcon,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
      description: 'Unpublished modules'
    },
    {
      name: 'Total Lessons',
      value: totalLessons.toLocaleString(),
      icon: PlayCircleIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      description: 'Lessons across all modules'
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
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              
              {/* Percentage badge */}
              {stat.name !== 'Total Modules' && stat.name !== 'Total Lessons' && totalModules > 0 && (
                <div className="text-xs text-gray-400">
                  {Math.round((parseInt(stat.value.replace(',', '')) / totalModules) * 100)}%
                </div>
              )}
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
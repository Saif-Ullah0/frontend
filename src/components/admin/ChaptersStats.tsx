// frontend/src/components/admin/ChaptersStats.tsx
"use client";

import { 
  BookOpenIcon, 
  PlayIcon, 
  DocumentTextIcon,
  AcademicCapIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ChaptersStatsProps {
  totalChapters: number;
  publishedChapters: number;
  draftChapters: number;
  videoChapters: number;
  textChapters: number;
  pdfChapters: number;
  quizChapters: number;
}

export default function ChaptersStats({ 
  totalChapters, 
  publishedChapters, 
  draftChapters,
  videoChapters,
  textChapters,
  pdfChapters,
  quizChapters
}: ChaptersStatsProps) {
  const stats = [
    {
      name: 'Total Chapters',
      value: totalChapters.toLocaleString(),
      icon: BookOpenIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      description: 'All course chapters'
    },
    {
      name: 'Published',
      value: publishedChapters.toLocaleString(),
      icon: EyeIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/20 to-green-600/20',
      description: 'Live chapters'
    },
    {
      name: 'Draft Chapters',
      value: draftChapters.toLocaleString(),
      icon: DocumentTextIcon,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-500/20 to-orange-600/20',
      description: 'Unpublished chapters'
    },
    {
      name: 'Video Content',
      value: videoChapters.toLocaleString(),
      icon: PlayIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      description: 'Video-based chapters'
    },
    {
      name: 'Text Content',
      value: textChapters.toLocaleString(),
      icon: AcademicCapIcon,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'from-cyan-500/20 to-cyan-600/20',
      description: 'Text-based chapters'
    },
    {
      name: 'PDF & Quiz',
      value: (pdfChapters + quizChapters).toLocaleString(),
      icon: ClockIcon,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-500/20 to-indigo-600/20',
      description: 'PDF docs and quizzes'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              {stat.name !== 'Total Chapters' && totalChapters > 0 && (
                <div className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded-full">
                  {Math.round((parseInt(stat.value.replace(',', '')) / totalChapters) * 100)}%
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
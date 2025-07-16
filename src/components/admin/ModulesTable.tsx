// frontend/src/components/admin/ModulesTable.tsx
"use client";

import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  RectangleStackIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  PlayCircleIcon,
  AcademicCapIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

interface Module {
  id: number;
  title: string;
  slug: string;
  description: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  course: {
    id: number;
    title: string;
    category: {
      name: string;
    };
  };
  _count?: {
    lessons: number;
  };
}

interface ModulesTableProps {
  modules: Module[];
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function ModulesTable({ 
  modules, 
  onEditModule, 
  onDeleteModule, 
  onRefresh 
}: ModulesTableProps) {
  const [deletingModules, setDeletingModules] = useState<Set<number>>(new Set());

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
      return 'Unknown';
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    setDeletingModules(prev => new Set(prev).add(moduleId));
    
    try {
      await onDeleteModule(moduleId);
    } finally {
      setDeletingModules(prev => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }
  };

  if (modules.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
        <RectangleStackIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No modules found</h3>
        <p className="text-gray-400 mb-4">Start by creating your first module to organize course content.</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Modules ({modules.length})</h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Module
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Lessons
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {modules.map((module) => (
              <tr 
                key={module.id} 
                className="hover:bg-white/5 transition-colors duration-200"
              >
                {/* Module Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <RectangleStackIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {module.title}
                      </div>
                      <div className="text-sm text-gray-400 max-w-xs truncate">
                        {module.description}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Course Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    <div className="font-medium flex items-center">
                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                      {module.course.title}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {module.course.category.name}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    module.isPublished 
                      ? 'bg-green-100 text-green-800 bg-opacity-20' 
                      : 'bg-yellow-100 text-yellow-800 bg-opacity-20'
                  }`}>
                    {module.isPublished ? (
                      <>
                        <EyeIcon className="h-3 w-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeSlashIcon className="h-3 w-3 mr-1" />
                        Draft
                      </>
                    )}
                  </span>
                </td>

                {/* Order */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 flex items-center">
                    <HashtagIcon className="h-3 w-3 mr-1" />
                    {module.order}
                  </div>
                </td>

                {/* Lessons Count */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 flex items-center">
                    <PlayCircleIcon className="h-4 w-4 mr-1" />
                    {module._count?.lessons || 0} lessons
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(module.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEditModule(module)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      disabled={deletingModules.has(module.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingModules.has(module.id) ? (
                        <>
                          <div className="animate-spin h-3 w-3 mr-1 border border-white border-t-transparent rounded-full"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <TrashIcon className="h-3 w-3 mr-1" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            Total: {modules.length} modules
          </div>
          <button
            onClick={onRefresh}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
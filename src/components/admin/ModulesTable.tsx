// components/admin/ModulesTable.tsx - Matching categories/courses style
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Module {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  price?: number;
  isFree?: boolean;
  isPublished: boolean;
  publishStatus?: string;
  orderIndex?: number;
  courseId: number;
  course: {
    id: number;
    title: string;
    category?: {
      id: number;
      name: string;
    };
  };
  chapters?: Array<{
    id: string;
    title: string;
    type: string;
    publishStatus: string;
    order?: number;
  }>;
  _count?: {
    chapters?: number;
    notes?: number;
    moduleEnrollments?: number;
    bundleItems?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

interface ModulesTableProps {
  modules: Module[];
  onEditModule: (module: Module) => void;  // Fixed prop name
  onDeleteModule: (moduleId: number) => void;  // Fixed prop name
  onRefresh: () => void;
}

export default function ModulesTable({ 
  modules, 
  onEditModule, 
  onDeleteModule, 
  onRefresh 
}: ModulesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (module: Module) => {
    if (module.isFree || module.price === 0) {
      return <span className="text-green-400 font-medium">Free</span>;
    }
    return <span className="text-white font-medium">${module.price?.toFixed(2)}</span>;
  };

  const getStatusBadge = (module: Module) => {
    if (module.isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
        Draft
      </span>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Module</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Course</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Price</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Chapters</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Created</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {modules.map((module) => (
              <tr key={module.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-6">
                  <div>
                    <h3 className="text-white font-semibold">{module.title}</h3>
                    {module.description && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="text-white font-medium">{module.course.title}</p>
                    {module.course.category && (
                      <p className="text-gray-400 text-sm">{module.course.category.name}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  {formatPrice(module)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-gray-300">{module._count?.chapters || 0}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(module)}
                </td>
                <td className="py-4 px-6">
                  <span className="text-gray-400 text-sm">{formatDate(module.createdAt)}</span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onEditModule(module)}  // Fixed prop name
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit module"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteModule(module.id)}  // Fixed prop name
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete module"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
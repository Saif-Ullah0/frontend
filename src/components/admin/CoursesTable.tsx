// components/admin/CoursesTable.tsx - Removed MODULES and ENROLLMENTS columns
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  isDeleted: boolean;
  publishStatus?: string;
  isPaid?: boolean;
  createdAt: string;
  category: {
    id: number;
    name: string;
  };
  _count?: {
    modules: number;
    enrollments: number;
  };
}

interface CoursesTableProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: number) => void;
  onRefresh: () => void;
}

export default function CoursesTable({ 
  courses, 
  onEditCourse, 
  onDeleteCourse, 
  onRefresh 
}: CoursesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (course: Course) => {
    if (course.price === 0) {
      return <span className="text-green-400 font-medium">Free</span>;
    }
    return <span className="text-white font-medium">${course.price.toFixed(2)}</span>;
  };

  const getStatusBadge = (course: Course) => {
    const isPublished = course.publishStatus === 'PUBLISHED' || course.publishStatus === undefined;
    
    if (isPublished) {
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
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">COURSE</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">CATEGORY</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">PRICE</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">STATUS</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">CREATED</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-gray-300">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {/* Course Image */}
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-white font-semibold">{course.title}</h3>
                      {course.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-1 max-w-xs">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                    {course.category.name}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {formatPrice(course)}
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(course)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">
                      {formatDate(course.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onEditCourse(course)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit course"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete course"
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
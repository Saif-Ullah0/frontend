// components/admin/CategoriesStats.tsx - Updated with price-based stats
interface CategoriesStatsProps {
  totalCategories: number;
  totalCourses: number;
  categoriesWithFreeCourses: number;
  categoriesWithPaidCourses: number;
  avgCoursesPerCategory: number;
}

export default function CategoriesStats({ 
  totalCategories,
  totalCourses,
  categoriesWithFreeCourses,
  categoriesWithPaidCourses,
  avgCoursesPerCategory
}: CategoriesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Total Categories */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Categories</p>
            <p className="text-2xl font-bold text-white">{totalCategories}</p>
          </div>
        </div>
      </div>

      {/* Total Courses */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Courses</p>
            <p className="text-2xl font-bold text-white">{totalCourses}</p>
          </div>
        </div>
      </div>

      
    </div>
  );
}
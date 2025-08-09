// components/admin/CoursesStats.tsx - Removed Total Revenue card
interface CoursesStatsProps {
  totalCourses: number;
  freeCourses: number;
  paidCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export default function CoursesStats({ 
  totalCourses,
  freeCourses,
  paidCourses,
  publishedCourses,
  draftCourses
}: CoursesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Courses */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Courses</p>
            <p className="text-2xl font-bold text-white">{totalCourses}</p>
            <p className="text-xs text-gray-500 mt-1">{publishedCourses} published, {draftCourses} draft</p>
          </div>
        </div>
      </div>

      {/* Free Courses */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Free Courses</p>
            <p className="text-2xl font-bold text-white">{freeCourses}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalCourses > 0 ? Math.round((freeCourses / totalCourses) * 100) : 0}% of total courses
            </p>
          </div>
        </div>
      </div>

      {/* Paid Courses */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Paid Courses</p>
            <p className="text-2xl font-bold text-white">{paidCourses}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalCourses > 0 ? Math.round((paidCourses / totalCourses) * 100) : 0}% of total courses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
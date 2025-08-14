// components/NavigationImprovements.tsx
// Navigation components and utilities for better user flow

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  HomeIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  EyeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  CogIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// ✅ Breadcrumb Component
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
          )}
          
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-white font-medium">
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// ✅ Back Button Component
interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export function BackButton({ href, label = "Back", className = '', onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${className}`}
    >
      <ArrowLeftIcon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ✅ Go to Video Button Component
interface GoToVideoButtonProps {
  videoId?: number;
  courseId?: number;
  moduleId?: number;
  chapterId?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function GoToVideoButton({ 
  videoId, 
  courseId, 
  moduleId, 
  chapterId, 
  className = '',
  size = 'md',
  variant = 'primary'
}: GoToVideoButtonProps) {
  // Construct video URL based on available IDs
  let videoUrl = '/videos';
  
  if (courseId && moduleId && chapterId) {
    videoUrl = `/courses/${courseId}/modules/${moduleId}/chapters/${chapterId}`;
  } else if (videoId) {
    videoUrl = `/videos/${videoId}`;
  } else if (courseId) {
    videoUrl = `/courses/${courseId}`;
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    ghost: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
  };

  return (
    <Link
      href={videoUrl}
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200
        ${sizeClasses[size]} ${variantClasses[variant]} ${className}
      `}
    >
      <PlayCircleIcon className="w-4 h-4" />
      Watch Video
    </Link>
  );
}

// ✅ Navigation Quick Actions Component
interface QuickActionsProps {
  userRole?: 'ADMIN' | 'USER';
  currentPage?: string;
  className?: string;
}

export function NavigationQuickActions({ userRole, currentPage, className = '' }: QuickActionsProps) {
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Home */}
      <Link
        href="/"
        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="Home"
      >
        <HomeIcon className="w-5 h-5" />
      </Link>

      {/* Courses */}
      <Link
        href="/courses"
        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="Browse Courses"
      >
        <AcademicCapIcon className="w-5 h-5" />
      </Link>

      {/* Bundles */}
      <Link
        href="/shop/bundles"
        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="Bundle Marketplace"
      >
        <ShoppingBagIcon className="w-5 h-5" />
      </Link>

      {/* My Learning */}
      <Link
        href="/my-courses"
        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="My Learning"
      >
        <BookOpenIcon className="w-5 h-5" />
      </Link>

      {/* Admin Panel (for admins) */}
      {isAdmin && (
        <>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <Link
            href="/admin/dashboard"
            className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors"
            title="Admin Dashboard"
          >
            <CogIcon className="w-5 h-5" />
          </Link>
        </>
      )}

      {/* View Toggle (Admin ↔ Student) */}
      {isAdmin && currentPage?.includes('/admin') && (
        <Link
          href={getStudentViewUrl(currentPage)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          title="Switch to Student View"
        >
          <EyeIcon className="w-4 h-4" />
          Student View
        </Link>
      )}

      {isAdmin && !currentPage?.includes('/admin') && (
        <Link
          href={getAdminViewUrl(currentPage)}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          title="Switch to Admin View"
        >
          <CogIcon className="w-4 h-4" />
          Admin View
        </Link>
      )}
    </div>
  );
}

// ✅ Helper function to get student view URL from admin URL
function getStudentViewUrl(adminUrl: string): string {
  if (adminUrl.includes('/admin/courses')) {
    return '/courses';
  } else if (adminUrl.includes('/admin/bundles')) {
    return '/shop/bundles';
  } else if (adminUrl.includes('/admin/users')) {
    return '/my-profile';
  } else if (adminUrl.includes('/admin')) {
    return '/dashboard';
  }
  return '/';
}

// ✅ Helper function to get admin view URL from student URL
function getAdminViewUrl(studentUrl: string): string {
  if (studentUrl.includes('/courses')) {
    return '/admin/courses';
  } else if (studentUrl.includes('/bundles') || studentUrl.includes('/shop')) {
    return '/admin/bundles';
  } else if (studentUrl.includes('/my-')) {
    return '/admin/users';
  }
  return '/admin/dashboard';
}

// ✅ Course/Bundle Action Buttons Component
interface ContentActionButtonsProps {
  contentType: 'course' | 'bundle' | 'module' | 'chapter';
  contentId: number;
  userRole?: 'ADMIN' | 'USER';
  isOwner?: boolean;
  isEnrolled?: boolean;
  isPurchased?: boolean;
  className?: string;
}

export function ContentActionButtons({
  contentType,
  contentId,
  userRole,
  isOwner,
  isEnrolled,
  isPurchased,
  className = ''
}: ContentActionButtonsProps) {
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* View Content */}
      <Link
        href={`/${contentType}s/${contentId}`}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        <EyeIcon className="w-4 h-4" />
        View {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
      </Link>

      {/* Admin Actions */}
      {isAdmin && (
        <Link
          href={`/admin/${contentType}s/${contentId}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          <CogIcon className="w-4 h-4" />
          Admin Edit
        </Link>
      )}

      {/* Go to Video (for courses/modules) */}
      {(contentType === 'course' || contentType === 'module') && (isEnrolled || isPurchased || isAdmin) && (
        <GoToVideoButton
          courseId={contentType === 'course' ? contentId : undefined}
          moduleId={contentType === 'module' ? contentId : undefined}
          variant="secondary"
        />
      )}

      {/* Student Learning Dashboard */}
      {(isEnrolled || isPurchased) && (
        <Link
          href="/my-courses"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <BookOpenIcon className="w-4 h-4" />
          My Learning
        </Link>
      )}
    </div>
  );
}

// ✅ Page Header with Navigation Component
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showBackButton?: boolean;
  backButtonProps?: BackButtonProps;
  userRole?: 'ADMIN' | 'USER';
  currentPage?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  showBackButton,
  backButtonProps,
  userRole,
  currentPage
}: PageHeaderProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Navigation Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && <BackButton {...backButtonProps} />}
          {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
        </div>
        
        <NavigationQuickActions userRole={userRole} currentPage={currentPage} />
      </div>

      {/* Title Row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          {description && (
            <p className="text-gray-400 text-lg">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Enhanced Course Card with Navigation
interface EnhancedCourseCardProps {
  course: {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
    price: number;
    level: string;
    duration?: number;
    enrollmentCount?: number;
    instructor?: { name: string };
    isEnrolled?: boolean;
  };
  userRole?: 'ADMIN' | 'USER';
  showAdminActions?: boolean;
}

export function EnhancedCourseCard({ course, userRole, showAdminActions }: EnhancedCourseCardProps) {
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
      {/* Course Image */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 aspect-video mb-4">
        {course.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <AcademicCapIcon className="w-12 h-12 text-white/50" />
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white line-clamp-2">{course.title}</h3>
        
        {course.description && (
          <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">{course.instructor?.name}</span>
          <span className="text-green-400 font-bold">${course.price.toFixed(2)}</span>
        </div>

        {/* Enhanced Actions */}
        <ContentActionButtons
          contentType="course"
          contentId={course.id}
          userRole={userRole}
          isEnrolled={course.isEnrolled}
          className="pt-3"
        />
      </div>
    </div>
  );
}

// ✅ Video Chapter Navigation Component
interface VideoChapterNavProps {
  courseId: number;
  moduleId: number;
  currentChapterId: number;
  chapters: Array<{
    id: number;
    title: string;
    type: string;
    duration: number;
    isCompleted?: boolean;
    isFree?: boolean;
  }>;
}

export function VideoChapterNav({ courseId, moduleId, currentChapterId, chapters }: VideoChapterNavProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h4 className="text-white font-semibold mb-3">Course Navigation</h4>
      
      <div className="space-y-2">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === currentChapterId;
          const isCurrent = chapter.id === currentChapterId;
          
          return (
            <Link
              key={chapter.id}
              href={`/courses/${courseId}/modules/${moduleId}/chapters/${chapter.id}`}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                  : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                  {index + 1}
                </span>
                
                <PlayCircleIcon className="w-4 h-4" />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{chapter.title}</p>
                  <p className="text-xs opacity-70">
                    {Math.round(chapter.duration / 60)} min
                    {chapter.isFree && ' • Free'}
                  </p>
                </div>
              </div>
              
              {chapter.isCompleted && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
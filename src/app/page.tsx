'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import {
  PlayCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ClockIcon,
  StarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

// Configure Inter font with specific subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: { name: string };
  modules: any[];
}

interface Bundle {
  id: number;
  name: string;
  description?: string;
  type: 'MODULE' | 'COURSE';
  finalPrice: number;
  totalPrice: number;
  salesCount: number;
  isFeatured: boolean;
}

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalModules: number;
  completionRate: number;
}

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [featuredBundles, setFeaturedBundles] = useState<Bundle[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchFeaturedCourses(),
          fetchFeaturedBundles(),
          fetchStats(),
        ]);
      } catch (err) {
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses?limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const courses = await response.json();
      if (Array.isArray(courses)) {
        setFeaturedCourses(courses.slice(0, 6));
      } else {
        console.error('Courses response is not an array:', courses);
        setFeaturedCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Error loading courses');
    }
  };

  const fetchFeaturedBundles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bundles/featured?limit=4');
      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }
      const data = await response.json();
      setFeaturedBundles(Array.isArray(data.featuredBundles) ? data.featuredBundles : []);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      setError('Error loading bundles');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const courses = await response.json();
      const totalCourses = Array.isArray(courses) ? courses.length : 0;
      const totalModules = Array.isArray(courses) ? courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0) : 0;
      
      setStats({
        totalCourses: totalCourses || 15,
        totalStudents: 1250,
        totalModules: totalModules || 180,
        completionRate: 94,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalCourses: 15,
        totalStudents: 1250,
        totalModules: 180,
        completionRate: 94,
      });
    }
  };

  const features = [
    {
      icon: BookOpenIcon,
      title: "Expert-Led Courses",
      description: "Learn from industry professionals with hands-on projects and real-world applications.",
      color: "blue"
    },
    {
      icon: ShoppingBagIcon,
      title: "Learning Bundles",
      description: "Save up to 50% with curated course bundles designed for specific career paths.",
      color: "purple"
    },
    {
      icon: DocumentCheckIcon,
      title: "Certification Ready",
      description: "Complete courses and earn certificates to showcase your new skills to employers.",
      color: "green"
    },
    {
      icon: ComputerDesktopIcon,
      title: "Learn Anywhere",
      description: "Access your courses on any device, download for offline learning, track your progress.",
      color: "orange"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Full Stack Developer",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face",
      text: "The React course completely transformed my career. I went from designer to full-stack developer in 6 months!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Data Scientist",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      text: "The Python for Data Science bundle gave me everything I needed. The projects were incredibly practical."
    },
    {
      name: "Emma Thompson",
      role: "UI/UX Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      text: "I love how the courses are structured. Step-by-step, practical, and I can learn at my own pace."
    }
  ];

  return (
    <div className={`${inter.variable} min-h-screen bg-gradient-to-br from-[#0a0b14] via-[#0e0f1a] to-[#1a0e2e] text-white overflow-hidden font-sans`}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-[100px] rounded-full animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-[80px] rounded-full animate-float"></div>
      </div>

      <div className="relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading content...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-24 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchFeaturedCourses();
                fetchFeaturedBundles();
                fetchStats();
              }}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Hero Section */}
        {!loading && !error && (
          <section className="pt-20 pb-32 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">
                      <SparklesIcon className="w-4 h-4" />
                      <span>Welcome to the Future of Learning</span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                      Master
                      <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Tech Skills </span>
                      That Actually Matter
                    </h1>
                    
                    <p className="text-xl text-gray-300 leading-relaxed">
                      Join thousands of developers, designers, and creators who are building their careers with our expert-led courses and hands-on projects. Learn at your own pace, get certified, and land your dream job.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      href="/courses"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <BookOpenIcon className="w-6 h-6" />
                      Explore Courses
                    </Link>
                    <Link 
                      href="/shop/bundles"
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBagIcon className="w-6 h-6" />
                      View Bundles
                    </Link>
                  </div>

                  {/* Quick Stats */}
                  {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">{stats.totalCourses}+</div>
                        <div className="text-sm text-gray-400">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">{stats.totalStudents.toLocaleString()}+</div>
                        <div className="text-sm text-gray-400">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{stats.totalModules}+</div>
                        <div className="text-sm text-gray-400">Modules</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-400">{stats.completionRate}%</div>
                        <div className="text-sm text-gray-400">Completion</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hero Visual */}
                <div className="relative">
                  <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 backdrop-blur-xl">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <PlayCircleIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Interactive Learning</h3>
                          <p className="text-sm text-gray-400">Code along with real projects</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">Course Progress</span>
                          <span className="text-sm text-green-400">85% Complete</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[85%]"></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-blue-400">12</div>
                          <div className="text-xs text-gray-400">Modules Completed</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-purple-400">4.9</div>
                          <div className="text-xs text-gray-400">Average Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center animate-bounce-slow">
                    <LightBulbIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center animate-pulse">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {!loading && !error && (
          <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">Why Choose Our Platform?</h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  We've built the most comprehensive learning experience for modern tech professionals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${
                      feature.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      feature.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      feature.color === 'green' ? 'from-green-500 to-green-600' :
                      'from-orange-500 to-orange-600'
                    } rounded-2xl flex items-center justify-center mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Courses */}
        {!loading && !error && featuredCourses.length > 0 && (
          <section className="py-24 px-6 bg-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-bold mb-4">Featured Courses</h2>
                  <p className="text-gray-400">Start your learning journey with our most popular courses</p>
                </div>
                <Link 
                  href="/categories"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-all flex items-center gap-2"
                >
                  View Categories
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCourses.slice(0, 6).map((course) => (
                  <Link 
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    {course.imageUrl ? (
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <AcademicCapIcon className="w-16 h-16 text-blue-400" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {course.category.name}
                        </span>
                        <span className="text-sm text-gray-400">{course.modules.length} modules</span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 line-clamp-2">{course.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{course.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">
                          {course.price > 0 ? `$${course.price}` : 'Free'}
                        </span>
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-400">4.8</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Bundles */}
        {!loading && !error && featuredBundles.length > 0 && (
          <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-bold mb-4">Learning Bundles</h2>
                  <p className="text-gray-400">Save up to 50% with our curated learning paths</p>
                </div>
                <Link 
                  href="/shop/bundles"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:scale-105 transition-all flex items-center gap-2"
                >
                  View All Bundles
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredBundles.slice(0, 4).map((bundle) => {
                  const savings = bundle.totalPrice - bundle.finalPrice;
                  const percentage = Math.round((savings / bundle.totalPrice) * 100);
                  
                  return (
                    <Link 
                      key={bundle.id}
                      href={`/bundles/${bundle.id}`}
                      className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-3xl p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                        FEATURED
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-3">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-gray-300 mb-4">{bundle.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className={`px-3 py-1 rounded-full ${
                            bundle.type === 'COURSE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {bundle.type === 'COURSE' ? 'Course Bundle' : 'Module Bundle'}
                          </span>
                          <span>{bundle.salesCount} students</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-white">${bundle.finalPrice}</span>
                          {savings > 0 && (
                            <span className="text-lg text-gray-400 line-through">${bundle.totalPrice}</span>
                          )}
                        </div>
                        {savings > 0 && (
                          <div className="text-green-400 font-medium">
                            Save ${savings} ({percentage}% off)
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {!loading && !error && (
          <section className="py-24 px-6 bg-white/5">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6">What Our Students Say</h2>
                <p className="text-xl text-gray-400">
                  Join thousands of successful graduates who transformed their careers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <img 
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed">{testimonial.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!loading && !error && (
          <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-12 backdrop-blur-xl">
                <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of students who are already building their dream careers. Start learning today with our expert-led courses and get the skills that matter.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/register"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg transition-all hover:scale-105"
                  >
                    Start Learning Now
                  </Link>
                  <Link 
                    href="/categories"
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-lg transition-all"
                  >
                    Browse Categories
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
// src/components/SystemNavigationGuide.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PlayIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  UserGroupIcon,
  CreditCardIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function SystemNavigationGuide() {
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const userFeatures = [
    {
      title: "📹 Video Viewing",
      description: "Watch course videos with full comment system",
      path: "/videos/[id]",
      icon: PlayIcon,
      color: "from-purple-500 to-pink-500",
      features: ["HD Video Player", "Nested Comments", "Like/Dislike", "Progress Tracking"],
      example: "Try: /videos/1"
    },
    {
      title: "📄 Notes & PDFs",
      description: "Access course materials with community discussions",
      path: "/notes/[id]",
      icon: DocumentIcon,
      color: "from-green-500 to-blue-500",
      features: ["PDF Viewer", "File Downloads", "Comment System", "Study Notes"],
      example: "Try: /notes/1"
    },
    {
      title: "💳 Checkout System",
      description: "Purchase courses with discount code validation",
      path: "/checkout",
      icon: CreditCardIcon,
      color: "from-yellow-500 to-orange-500",
      features: ["Discount Validation", "Real-time Pricing", "Secure Checkout", "Order Summary"],
      example: "Try: /checkout?courseId=1"
    },
    {
      title: "🎯 User Dashboard",
      description: "Track your learning progress and achievements",
      path: "/dashboard",
      icon: AcademicCapIcon,
      color: "from-blue-500 to-purple-500",
      features: ["Course Progress", "Weekly Goals", "Learning Stats", "Quick Access"],
      example: "Try: /dashboard"
    }
  ];

  const adminFeatures = [
    {
      title: "🏷️ Discount Management",
      description: "Create and manage discount codes",
      path: "/admin/discounts",
      icon: TagIcon,
      color: "from-red-500 to-pink-500",
      features: ["Create Discounts", "Usage Analytics", "Expiry Management", "Percentage/Fixed"],
      example: "Admin: /admin/discounts"
    },
    {
      title: "📹 Video Management",
      description: "Upload and organize course videos",
      path: "/admin/video-test",
      icon: VideoCameraIcon,
      color: "from-purple-500 to-indigo-500",
      features: ["Video Upload", "Course Assignment", "Publish/Draft", "Analytics"],
      example: "Admin: /admin/video-test"
    },
    {
      title: "📚 Notes Management",
      description: "Manage course notes and PDF materials",
      path: "/admin/notes",
      icon: DocumentIcon,
      color: "from-green-500 to-teal-500",
      features: ["PDF Upload", "Content Management", "Download Stats", "Organization"],
      example: "Admin: /admin/notes"
    },
    {
      title: "👥 User Management",
      description: "Manage platform users and permissions",
      path: "/admin/users",
      icon: UserGroupIcon,
      color: "from-blue-500 to-cyan-500",
      features: ["User Analytics", "Role Management", "Activity Tracking", "Support"],
      example: "Admin: /admin/users"
    }
  ];

  const commentFeatures = [
    {
      title: "💬 Nested Comments",
      description: "Full-featured comment system with threading",
      features: ["Unlimited Nesting", "Real-time Reactions", "Edit/Delete", "Moderation"]
    },
    {
      title: "👍 Reactions System", 
      description: "Like and dislike functionality with live counts",
      features: ["Like/Dislike", "Real-time Updates", "User Tracking", "Analytics"]
    },
    {
      title: "✏️ Comment Management",
      description: "Full CRUD operations for comments",
      features: ["Create/Edit/Delete", "Author Verification", "Spam Protection", "History"]
    }
  ];

  const discountFeatures = [
    {
      title: "🎫 Admin Discount Creation",
      description: "Powerful discount management tools",
      features: ["Percentage/Fixed", "Usage Limits", "Date Ranges", "Min Order Amount"]
    },
    {
      title: "✅ User Discount Validation",
      description: "Real-time discount code validation",
      features: ["Instant Validation", "Price Calculation", "Error Handling", "Applied State"]
    },
    {
      title: "📊 Analytics & Tracking",
      description: "Track discount usage and effectiveness", 
      features: ["Usage Stats", "Revenue Impact", "Popular Codes", "Expiry Tracking"]
    }
  ];

  const handleNavigate = (path: string) => {
    if (path.includes('[id]')) {
      // Replace with example ID
      const examplePath = path.replace('[id]', '1');
      router.push(examplePath);
    } else {
      router.push(path);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🚀 Complete EdTech Platform Navigation
        </h2>
        <p className="text-gray-400 text-lg">
          Comment System + Discount Management + User Experience
        </p>
      </div>

      {/* User Features */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <AcademicCapIcon className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white">👨‍🎓 Student Features</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {userFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              onClick={() => handleNavigate(feature.path)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {feature.features.map((feat, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-full"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-blue-400 font-mono">
                    {feature.example}
                  </div>
                </div>
                
                <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Features */}
      {isAdmin && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white">👨‍💼 Admin Features</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {adminFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                onClick={() => handleNavigate(feature.path)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {feature.features.map((feat, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-full"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-xs text-red-400 font-mono">
                      {feature.example}
                    </div>
                  </div>
                  
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment System Features */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white">💬 Comment System Features</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {commentFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h4 className="font-semibold text-white mb-3">{feature.title}</h4>
              <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
              
              <div className="space-y-2">
                {feature.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount System Features */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <TagIcon className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white">🏷️ Discount System Features</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {discountFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h4 className="font-semibold text-white mb-3">{feature.title}</h4>
              <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
              
              <div className="space-y-2">
                {feature.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300 text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
          >
            <AcademicCapIcon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-white">Dashboard</div>
          </button>
          
          <button
            onClick={() => router.push('/videos/1')}
            className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
          >
            <PlayIcon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-sm text-white">Watch Video</div>
          </button>
          
          <button
            onClick={() => router.push('/checkout?courseId=1')}
            className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
          >
            <ShoppingCartIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-white">Checkout</div>
          </button>
          
          {isAdmin && (
            <button
              onClick={() => router.push('/admin/discounts')}
              className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-center"
            >
              <TagIcon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-sm text-white">Discounts</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
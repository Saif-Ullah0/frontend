// components/Footer.tsx
import Link from 'next/link';
import { 
  AcademicCapIcon, 
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Learning',
      links: [
        { name: 'All Courses', href: '/courses' },
        { name: 'Bundle Marketplace', href: '/shop/bundles' },
        { name: 'My Learning', href: '/dashboard' },
        { name: 'My Bundles', href: '/bundles' },
      ]
    },
    {
      title: 'Categories',
      links: [
        { name: 'Web Development', href: '/courses?category=web-development' },
        { name: 'Data Science', href: '/courses?category=data-science' },
        { name: 'Mobile Development', href: '/courses?category=mobile-development' },
        { name: 'UI/UX Design', href: '/courses?category=ui-ux-design' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Community', href: '/community' },
        { name: 'Bug Report', href: '/bug-report' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Partners', href: '/partners' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/eduplatform', icon: '𝕏' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/eduplatform', icon: '💼' },
    { name: 'GitHub', href: 'https://github.com/eduplatform', icon: '⚡' },
    { name: 'Discord', href: 'https://discord.gg/eduplatform', icon: '💬' },
  ];

  return (
    <footer className="relative bg-black/40 border-t border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                EduPlatform
              </span>
            </div>
            
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Empowering developers, designers, and creators worldwide with industry-leading courses and hands-on learning experiences.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-4 h-4 text-blue-400" />
                <span>support@eduplatform.com</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-4 h-4 text-blue-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpenIcon className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">150+</span>
            </div>
            <p className="text-sm text-gray-400">Expert Courses</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserGroupIcon className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">50K+</span>
            </div>
            <p className="text-sm text-gray-400">Active Students</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShoppingBagIcon className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">25+</span>
            </div>
            <p className="text-sm text-gray-400">Learning Bundles</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ChartBarIcon className="w-5 h-5 text-orange-400" />
              <span className="text-2xl font-bold text-white">95%</span>
            </div>
            <p className="text-sm text-gray-400">Success Rate</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-6">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 mr-2">Follow us:</span>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center transition-all text-lg hover:scale-110"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Copyright and Legal */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
            <span>© {currentYear} EduPlatform. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-xl font-bold text-white mb-3">Stay Updated</h4>
            <p className="text-gray-400 mb-6 text-sm">
              Get the latest courses, updates, and exclusive offers delivered to your inbox.
            </p>
            
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all hover:scale-105"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-xs text-gray-500 mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
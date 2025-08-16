'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Mail, Users, Book, Award, Twitter, Linkedin, Github, MessageCircle } from 'lucide-react'; // Use lucide-react for consistency with Navbar

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  // Hide Footer on specific pages (e.g., login, register)
  const hideFooterPaths = ['/login', '/register'];
  if (hideFooterPaths.includes(pathname)) {
    return null;
  }

  const footerSections = [
    {
      title: 'Learning',
      links: [
        { name: 'All Courses', href: '/courses' },
        { name: 'Bundle Marketplace', href: '/shop/bundles' },
        { name: 'My Learning', href: '/dashboard' },
        { name: 'My Bundles', href: '/bundles' },
      ],
    },
    {
      title: 'Categories',
      links: [
        { name: 'Web Development', href: '/courses?category=web-development' },
        { name: 'Data Science', href: '/courses?category=data-science' },
        { name: 'Mobile Development', href: '/courses?category=mobile-development' },
        { name: 'UI/UX Design', href: '/courses?category=ui-ux-design' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Community', href: '/community' },
        { name: 'Bug Report', href: '/bug-report' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Partners', href: '/partners' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Discord', href: '#', icon: MessageCircle },
  ];

  const handleNewsletterSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (email.trim()) {
      // Placeholder for newsletter subscription logic
      console.log('Subscribed with email:', email);
      setEmail('');
      alert('Thank you for subscribing!');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-white">EduPlatform</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Empowering learners with industry-leading courses and hands-on experiences.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" aria-hidden="true" />
                <span>support@eduplatform.com</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                      aria-label={`Navigate to ${link.name}`}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-t border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Book className="w-5 h-5 text-blue-400" aria-hidden="true" />
              <span className="text-lg font-bold text-white">100+</span>
            </div>
            <p className="text-xs text-gray-400">Courses</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-5 h-5 text-purple-400" aria-hidden="true" />
              <span className="text-lg font-bold text-white">10K+</span>
            </div>
            <p className="text-xs text-gray-400">Students</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Book className="w-5 h-5 text-green-400" aria-hidden="true" />
              <span className="text-lg font-bold text-white">20+</span>
            </div>
            <p className="text-xs text-gray-400">Bundles</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Award className="w-5 h-5 text-orange-400" aria-hidden="true" />
              <span className="text-lg font-bold text-white">90%</span>
            </div>
            <p className="text-xs text-gray-400">Completion Rate</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4 border-t border-gray-700">
          {/* Social Links */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Follow us:</span>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all"
                aria-label={`Follow us on ${social.name}`}
              >
                <social.icon className="w-4 h-4 text-gray-300 hover:text-blue-400" aria-hidden="true" />
              </a>
            ))}
          </div>

          {/* Copyright and Legal */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-gray-400">
            <span>© {currentYear} EduPlatform. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors" aria-label="Privacy Policy">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors" aria-label="Terms of Service">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-blue-400 transition-colors" aria-label="Cookie Policy">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-bold text-white mb-2">Stay Updated</h4>
            <p className="text-xs text-gray-400 mb-4">
              Get the latest courses and exclusive offers delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                aria-label="Email for newsletter"
              />
              <button
                onClick={handleNewsletterSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                aria-label="Subscribe to newsletter"
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        router.push('/login');
      } else {
        alert('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Something went wrong');
    }
  };

  // Determine if we are on the homepage
  const isHomePage = pathname === '/';

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white px-6 py-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-3xl font-extrabold tracking-tight">
          <Link href="/" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-300 hover:to-purple-400 transition-all duration-300">
            EduPlatform
          </Link>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-base font-medium">
          <li>
            <Link href="/" className="relative group">
              <span className="hover:text-blue-300 transition-colors duration-200">Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="/categories" className="relative group">
              <span className="hover:text-blue-300 transition-colors duration-200">Categories</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="/courses" className="relative group">
              <span className="hover:text-blue-300 transition-colors duration-200">Courses</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="/my-courses" className="relative group">
              <span className="hover:text-blue-300 transition-colors duration-200">My Courses</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="/bundles" className="relative group">
              <span className="hover:text-blue-300 transition-colors duration-200">Bundles</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="/my-bundles" className="relative group">
              <span className="hover:text-blue-300 transition-colors duration-200">My Bundles</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          {isHomePage && (
            <>
              <li>
                <Link href="/login" className="relative group">
                  <span className="hover:text-blue-300 transition-colors duration-200">Login</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </li>
            </>
          )}
          <li>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
            >
              Logout
            </button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-indigo-800 rounded-lg shadow-lg p-4">
          <ul className="flex flex-col gap-4 text-base font-medium">
            <li>
              <Link href="/" className="hover:text-blue-300 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-blue-300 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                Categories
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-blue-300 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                Courses
              </Link>
            </li>
            <li>
              <Link href="/my-courses" className="hover:text-blue-300 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                My Courses
              </Link>
            </li>
            <li>
              <Link href="/bundles" className="hover:text-blue-300 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                Bundles
              </Link>
            </li>
            <li>
              <Link href="/my-bundles" className="hover:text-blue-300 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                My Bundles
              </Link>
            </li>
            {isHomePage && (
              <>
                <li>
                  <Link href="/login" className="hover:text-blue-300 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </li>
              </>
            )}
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="inline-block px-4 py-2 bg-red-500 rounded-full hover:bg-red-600 transition-all duration-300"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
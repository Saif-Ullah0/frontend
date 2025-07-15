'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

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

  return (
    <nav className="bg-[#111827] text-white px-6 py-4 shadow-md flex items-center justify-between">
      <div className="text-2xl font-bold text-blue-400">
        <Link href="/">EduVerse</Link>
      </div>
      <ul className="flex gap-6 text-sm">
        <li><Link href="/categories" className="hover:text-blue-400">Categories</Link></li>
        <li><Link href="/my-courses" className="hover:text-blue-400">My Courses</Link></li>
        <li><Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link></li>
        <li><Link href="/profile" className="hover:text-blue-400">Profile</Link></li>
        <li><Link href="/search" className="hover:text-blue-300">Search</Link></li>

        <li>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-500 font-medium"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

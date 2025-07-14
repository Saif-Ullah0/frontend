'use client';

import { useEffect, useState } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Not authorized');
        }

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] text-white">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] text-white">
        <p>Not authorized. Please <a href="/login" className="text-blue-400 underline">login</a>.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0e1a] px-6 py-20 text-white">
      <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">👤 Profile</h1>
        <p className="mb-2"><span className="text-gray-400">Name:</span> {user.name}</p>
        <p className="mb-2"><span className="text-gray-400">Email:</span> {user.email}</p>
        <p className="mb-2"><span className="text-gray-400">Role:</span> {user.role}</p>
        <p className="text-gray-500 text-sm mt-4">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
    </main>
  );
}

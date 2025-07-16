// frontend/src/app/admin/users/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import UsersTable from '@/components/admin/UsersTable';
import UsersStats from '@/components/admin/UsersStats';
import UserModal from '@/components/admin/UserModal';
import { MagnifyingGlassIcon, UserPlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async (): Promise<void> => {
    console.log('🔍 Users: Fetching all users...');
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔍 Users: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Users: 401 Unauthorized - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          console.log('❌ Users: 403 Forbidden - redirecting to home');
          router.push('/');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Users: Users data received:', data);
      
      setUsers(data);
      
    } catch (err: unknown) {
      console.error('❌ Users: Error fetching users:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const errorStack = err instanceof Error ? err.stack : 'No stack trace';
      
      console.error('❌ Users: Error details:', {
        message: errorMessage,
        stack: errorStack
      });
      
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      console.log('🔍 Users: Setting loading to false');
      setLoading(false);
    }
  }; // Fixed: Added missing closing brace

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handlePromoteUser = async (userId: number): Promise<void> => {
    console.log('🔍 Users: Promoting user to admin:', userId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/promote`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to promote user: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Users: User promoted successfully:', result);
      
      // Refresh users list
      await fetchUsers();
      
    } catch (err: unknown) {
      console.error('❌ Users: Error promoting user:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to promote user';
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers(); // Refresh the list
  };

  if (loading) {
    console.log('🔍 Users: Rendering loading state...');
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    console.log('🔍 Users: Rendering error state:', error);
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  console.log('🔍 Users: Rendering users page with data:', {
    totalUsers: users.length,
    filteredUsers: filteredUsers.length,
    searchTerm,
    roleFilter
  });

  const adminCount = users.filter(user => user.role === 'ADMIN').length;
  const userCount = users.filter(user => user.role === 'USER').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
            <p className="text-gray-400">Manage platform users and permissions</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCreateUser}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <UsersStats
          totalUsers={users.length}
          adminCount={adminCount}
          userCount={userCount}
        />

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'USER')}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admins</option>
                <option value="USER">Users</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
            {searchTerm && (
              <span className="ml-2">
                • Search: "{searchTerm}"
              </span>
            )}
            {roleFilter !== 'ALL' && (
              <span className="ml-2">
                • Role: {roleFilter}
              </span>
            )}
          </div>
        </div>

        {/* Users Table */}
        <UsersTable
          users={filteredUsers}
          onEditUser={handleEditUser}
          onPromoteUser={handlePromoteUser}
          onRefresh={fetchUsers}
        />

        {/* User Modal */}
        {isModalOpen && (
          <UserModal
            user={editingUser}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
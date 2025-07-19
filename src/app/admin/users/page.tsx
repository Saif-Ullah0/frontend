// frontend/src/app/admin/users/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import UsersTable from '@/components/admin/UsersTable';
import UsersStats from '@/components/admin/UsersStats';
import UserModal from '@/components/admin/UserModal';
import { 
  MagnifyingGlassIcon, 
  UserPlusIcon, 
  FunnelIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          router.push('/');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data);
      
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  const clearAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
  };

  const hasActiveFilters = searchTerm || roleFilter !== 'ALL';

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handlePromoteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to promote this user to admin? This will give them full administrative access.')) {
      return;
    }
    
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

      // Refresh users list
      await fetchUsers();
      
    } catch (err: unknown) {
      console.error('Error promoting user:', err);
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
    fetchUsers();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white">Loading users...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-400 mb-4">⚠️ {error}</div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const adminCount = users.filter(user => user.role === 'ADMIN').length;
  const userCount = users.filter(user => user.role === 'USER').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
            <p className="text-gray-400">Manage platform users and administrative permissions</p>
          </div>
          
          <button 
            onClick={handleCreateUser}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Stats */}
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
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[120px]"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'USER')}
              >
                <option value="ALL" className="bg-gray-900">All Roles</option>
                <option value="ADMIN" className="bg-gray-900">Admins</option>
                <option value="USER" className="bg-gray-900">Users</option>
              </select>
            </div>
          </div>

          {/* Results Summary & Clear Filters */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
              {searchTerm && (
                <span className="ml-2 text-blue-400">
                  • Search: &quot;{searchTerm}&quot;
                </span>
              )}
              {roleFilter !== 'ALL' && (
                <span className="ml-2 text-blue-400">
                  • Role: {roleFilter}
                </span>
              )}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
            <div className="text-gray-400 mb-4">
              {hasActiveFilters ? (
                <>
                  <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="mb-4">No users match your current filters.</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No users yet</h3>
                  <p className="mb-4">Add your first user to get started.</p>
                  <button
                    onClick={handleCreateUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First User
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <UsersTable
            users={filteredUsers}
            onEditUser={handleEditUser}
            onPromoteUser={handlePromoteUser}
            onRefresh={fetchUsers}
          />
        )}

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
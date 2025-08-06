// frontend/src/components/admin/UsersTable.tsx
"use client";

import { useState } from 'react';
import { 
  ShieldCheckIcon, 
  UserCircleIcon, 
  ArrowUpIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  CalendarIcon,
  PencilIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: string;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onPromoteUser: (userId: number) => Promise<void>;
  onToggleUserStatus: (userId: number, currentStatus: string) => Promise<void>;
  onDeleteUser: (userId: number, userName: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function UsersTable({ 
  users, 
  onEditUser, 
  onPromoteUser, 
  onToggleUserStatus,
  onDeleteUser,
  onRefresh 
}: UsersTableProps) {
  const [promotingUsers, setPromotingUsers] = useState<Set<number>>(new Set());
  const [actioningUsers, setActioningUsers] = useState<Set<number>>(new Set());

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  const handlePromoteUser = async (userId: number) => {
    setPromotingUsers(prev => new Set(prev).add(userId));
    
    try {
      await onPromoteUser(userId);
    } finally {
      setPromotingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const isBlocking = currentStatus === 'ACTIVE';
    const action = isBlocking ? 'block' : 'unblock';
    
    if (!confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
      return;
    }

    setActioningUsers(prev => new Set(prev).add(userId));
    
    try {
      await onToggleUserStatus(userId, currentStatus);
    } finally {
      setActioningUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    setActioningUsers(prev => new Set(prev).add(userId));
    
    try {
      await onDeleteUser(userId, user.name);
    } finally {
      setActioningUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
        <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
        <p className="text-gray-400 mb-4">Try adjusting your search criteria or add some users.</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Users ({users.length})</h3>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-white/5 transition-colors duration-200"
              >
                {/* User Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white flex items-center">
                        {user.name}
                        {user.role === 'ADMIN' && (
                          <ShieldCheckIcon className="h-4 w-4 text-red-400 ml-2" />
                        )}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800 bg-opacity-20' 
                      : 'bg-blue-100 text-blue-800 bg-opacity-20'
                  }`}>
                    {user.role === 'ADMIN' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 bg-opacity-20">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 bg-opacity-20">
                      <NoSymbolIcon className="h-3 w-3 mr-1" />
                      Blocked
                    </span>
                  )}
                </td>

                {/* Joined Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(user.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>

                    {user.role === 'USER' && (
                      <button
                        onClick={() => handlePromoteUser(user.id)}
                        disabled={promotingUsers.has(user.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {promotingUsers.has(user.id) ? (
                          <>
                            <div className="animate-spin h-3 w-3 mr-1 border border-white border-t-transparent rounded-full"></div>
                            Promoting...
                          </>
                        ) : (
                          <>
                            <ArrowUpIcon className="h-3 w-3 mr-1" />
                            Promote
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      disabled={actioningUsers.has(user.id)}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.status === 'ACTIVE' 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {actioningUsers.has(user.id) ? (
                        <>
                          <div className="animate-spin h-3 w-3 mr-1 border border-white border-t-transparent rounded-full"></div>
                          Working...
                        </>
                      ) : (
                        <>
                          {user.status === 'ACTIVE' ? (
                            <>
                              <NoSymbolIcon className="h-3 w-3 mr-1" />
                              Block
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Unblock
                            </>
                          )}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={actioningUsers.has(user.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                    
                    <button className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors">
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            Total: {users.length} users
          </div>
          <button
            onClick={onRefresh}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
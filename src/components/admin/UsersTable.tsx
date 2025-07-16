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
  PencilIcon
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onPromoteUser: (userId: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function UsersTable({ users, onEditUser, onPromoteUser, onRefresh }: UsersTableProps) {
  const [promotingUsers, setPromotingUsers] = useState<Set<number>>(new Set());

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
                      : 'bg-green-100 text-green-800 bg-opacity-20'
                  }`}>
                    {user.role === 'ADMIN' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                    {user.role}
                  </span>
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
                            Promote to Admin
                          </>
                        )}
                      </button>
                    )}
                    
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
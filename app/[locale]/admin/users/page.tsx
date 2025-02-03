'use client';

import { useState } from 'react';
import { User } from '../types/user';
import { format } from 'date-fns';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    createdAt: '2024-02-20T15:30:00Z',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'user',
    createdAt: '2024-03-01T09:15:00Z',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'admin',
    createdAt: '2024-03-10T14:20:00Z',
  },
];

export default function UsersPage() {
  const [users] = useState<User[]>(mockUsers);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 font-semibold text-gray-600">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Created At</div>
        </div>

        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 transition-colors items-center"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                  {user.name.charAt(0)}
                </div>
                <span className="ml-3 font-medium">{user.name}</span>
              </div>
              <div className="text-gray-600">{user.email}</div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-gray-500">
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

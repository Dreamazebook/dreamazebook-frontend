'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { API_ADMIN_USERS } from '@/constants/api';
import { ApiResponse } from '@/types/api';

interface User {
  id: string;
  name?: string;
  email: string;
  created_at: string;
  updated_at: string;
  region?: string;
  source?: string;
  satisfaction?: string;
  order_count?: number;
  total_spent?: number;
}

export const useUsersData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<ApiResponse<User[]>>(API_ADMIN_USERS);
        if (response.success && response.data) {
          // Add mock data for demonstration
          const enhancedUsers = response.data.map((user, index) => ({
            ...user,
            region: index % 2 === 0 ? '中国·四川' : '美国·加州',
            source: index % 3 === 0 ? 'ins' : index % 3 === 1 ? 'Facebook' : 'Google',
            satisfaction: index % 2 === 0 ? '满意' : '不满意',
            order_count: Math.floor(Math.random() * 10) + 1,
            total_spent: Math.floor(Math.random() * 1000) + 100,
          }));
          setUsers(enhancedUsers);
        } else {
          setError('Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error, setUsers };
};
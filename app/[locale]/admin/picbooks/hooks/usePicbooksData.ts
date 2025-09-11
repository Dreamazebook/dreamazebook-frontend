'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { API_ADMIN_PICBOOKS } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { DetailedBook } from '@/types/book';

export const usePicbooksData = () => {
  const [picbooks, setPicbooks] = useState<DetailedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPicbooks = async () => {
      try {
        const response = await api.get<ApiResponse<DetailedBook[]>>(API_ADMIN_PICBOOKS);
        if (response.success && response.data) {
          setPicbooks(response.data);
        } else {
          setError('Failed to fetch picbooks');
        }
      } catch (err) {
        console.error('Error fetching picbooks:', err);
        setError('Failed to load picbooks');
      } finally {
        setLoading(false);
      }
    };

    fetchPicbooks();
  }, []);

  return { picbooks, loading, error, setPicbooks };
};
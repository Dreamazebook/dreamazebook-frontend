'use client';

import { useState, useEffect } from 'react';

interface AuditItem {
  id: string;
  order_id: string;
  duration: string;
  book_count: number;
  auditor: string;
  books: Array<{
    id: string;
    name: string;
    preview_image: string;
    status: 'pending' | 'completed' | 'rejected';
  }>;
  created_at: string;
}

export const useAuditsData = () => {
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        // Mock data for demonstration
        const mockAudits: AuditItem[] = [
          {
            id: '1',
            order_id: '2323444433',
            duration: '12:24',
            book_count: 10,
            auditor: '鱼鱼鱼、玉深',
            books: [
              {
                id: '1',
                name: 'Good Night',
                preview_image: '/imgs/picbook/goodnight/封面1.jpg',
                status: 'pending'
              },
              {
                id: '2',
                name: 'Good Night',
                preview_image: '/imgs/picbook/goodnight/封面2.jpg',
                status: 'completed'
              }
            ],
            created_at: '2023-11-28T10:00:00Z'
          },
          {
            id: '2',
            order_id: '2323444433',
            duration: '42:24',
            book_count: 12,
            auditor: '鱼鱼鱼、玉深',
            books: [
              {
                id: '3',
                name: 'Birthday Book',
                preview_image: '/imgs/picbook/goodnight/封面3.jpg',
                status: 'completed'
              },
              {
                id: '4',
                name: 'Your Melody',
                preview_image: '/imgs/picbook/goodnight/封面4.jpg',
                status: 'rejected'
              }
            ],
            created_at: '2023-11-27T14:30:00Z'
          }
        ];
        
        setAudits(mockAudits);
      } catch (err) {
        console.error('Error fetching audits:', err);
        setError('Failed to load audits');
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  return { audits, loading, error, setAudits };
};
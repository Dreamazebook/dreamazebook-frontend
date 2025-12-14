"use client";

import { useEffect } from 'react';
import ProfileSidebar from './components/ProfileSidebar';
import useUserStore from '@/stores/userStore';

export default function ProfileLayout({
  children,  
}: {
  children: React.ReactNode;
}) {
  const { fetchOrderStatus } = useUserStore();

  useEffect(() => {
    fetchOrderStatus();
  }, [fetchOrderStatus]);
  
  return (
    <ProfileSidebar>{children}</ProfileSidebar>
  );
}

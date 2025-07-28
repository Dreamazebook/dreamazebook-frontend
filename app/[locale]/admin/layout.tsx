'use client';
import { FC, ReactNode, useEffect } from 'react';
import '../globals.css';
import useUserStore from '@/stores/userStore';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  const {fetchCurrentUser,user} = useUserStore();
  useEffect(()=> {
    fetchCurrentUser();
  },[])
  return (
    <html>
    <body>
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
    </body>
    </html>
  );
};

export default AdminLayout; 
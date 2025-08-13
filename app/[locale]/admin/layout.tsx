'use client';
import { FC, ReactNode, useEffect } from 'react';
import { Link } from "@/i18n/routing";
import { usePathname, useRouter } from 'next/navigation';
import '../globals.css';
import useUserStore from '@/stores/userStore';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  const {fetchCurrentUser,user,logout} = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(()=> {
    fetchCurrentUser();
  },[])
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };
  
  return (
    <html>
    <body>
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          {user && (
            <p className="text-sm text-gray-600 mt-2">Welcome, {user.name || user.email}</p>
          )}
        </div>
        
        <nav className="mt-6">
          <div className="px-6 py-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Navigation
            </h2>
          </div>
          
          <div className="mt-2 space-y-1">
            <Link
              href="/admin"
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                pathname === '/admin' || pathname.endsWith('/admin')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg
                className="mr-3 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                />
              </svg>
              Dashboard
            </Link>
            
            <Link
              href="/admin/users"
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive('/admin/users')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg
                className="mr-3 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              Users
            </Link>
            
            <Link
              href="/admin/orders"
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive('/admin/orders')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg
                className="mr-3 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Orders
            </Link>
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <button
            onClick={() => {
              // Add logout functionality here
              logout();
              router.push('/');
            }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors duration-200"
          >
            <svg
              className="mr-3 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

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
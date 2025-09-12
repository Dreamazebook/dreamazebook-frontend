'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { Link } from "@/i18n/routing";
import { usePathname, useRouter } from '@/i18n/routing';
import '../globals.css';
import useUserStore from '@/stores/userStore';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  const {fetchCurrentUser,user,logout} = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(()=> {
    fetchCurrentUser();
  },[])
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };
  
  return (
    <html>
    <body>
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-20 w-full bg-white shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-1 bg-black/50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed z-2 lg:sticky top-0 h-screen w-64 bg-white shadow-md transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition duration-300 ease-in-out flex-shrink-0`}>
        <div className="p-6">
          <Link href="/" className="block mb-4 text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
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
            
            <Link
              href="/admin/picbooks"
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive('/admin/picbooks')
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Picbooks
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
      <main className="flex-1 min-h-screen p-4 lg:p-8 pt-16 lg:pt-8 overflow-auto">
        {children}
      </main>
    </div>
    </body>
    </html>
  );
};

export default AdminLayout; 
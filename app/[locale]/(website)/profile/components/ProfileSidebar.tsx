"use client";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import useUserStore from "@/stores/userStore";
import { useRouter } from "next/navigation";

export default function ProfileSidebar({ children }:{children:React.ReactNode}) {
  const {user, logout} = useUserStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with colorful letters */}
      <div className="bg-white p-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="md:hidden mr-4 p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "X" : "Menu"}
            </button>

            <div className="flex items-center mr-4 md:mr-8">
              <span className="text-xl md:text-3xl font-bold text-orange-500">
                R
              </span>
              <span className="text-xl md:text-3xl font-bold text-blue-900">
                E
              </span>
              <span className="text-xl md:text-3xl font-bold text-green-500">
                A
              </span>
              <span className="text-xl md:text-3xl font-bold text-purple-400">
                D
              </span>
              <span className="text-xl md:text-3xl font-bold text-blue-500">
                A
              </span>
              <span className="text-xl md:text-3xl font-bold text-yellow-400">
                Z
              </span>
              <span className="text-xl md:text-3xl font-bold text-blue-900">
                E
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-xl md:text-3xl font-bold text-orange-500">
                B
              </span>
              <span className="text-xl md:text-3xl font-bold text-green-500">
                O
              </span>
              <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-500 rounded-full flex items-center justify-center mx-1">
                <span className="text-white text-sm md:text-xl font-bold">
                  O
                </span>
              </div>
              <span className="text-xl md:text-3xl font-bold text-orange-500">
                K
              </span>
              <span className="text-xl md:text-3xl font-bold text-orange-500">
                S
              </span>
            </div>
          </div>
          <div className="text-sm md:text-lg font-medium text-gray-700 hidden sm:block">
            Good Morning, {user?.name} !
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 md:p-6">
        <div className="flex gap-4 md:gap-8">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
                  fixed md:relative top-0 left-0 z-50 md:z-auto
                  w-64 md:w-56 h-full md:h-auto
                  bg-white rounded-none md:rounded-lg shadow-lg md:shadow-sm 
                  p-6 transform transition-transform duration-300 ease-in-out
                  ${
                    sidebarOpen
                      ? "translate-x-0"
                      : "-translate-x-full md:translate-x-0"
                  }
                `}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 overflow-hidden">
                <img
                  src="/api/placeholder/64/64"
                  alt="Augustine"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-medium text-gray-900">{user?.name}</h2>
            </div>

            <nav className="space-y-1">
              <Link
                href="/profile"
                className={`block px-3 py-2 rounded font-medium ${
                  pathname === '/en/profile' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/profile/detail"
                className={`block px-3 py-2 rounded ${
                  pathname === '/en/profile/detail' 
                    ? 'text-blue-600 bg-blue-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Account Details
              </Link>
              <Link
                href="/profile/order-history"
                className={`block px-3 py-2 rounded ${
                  pathname === '/en/profile/order-history' 
                    ? 'text-blue-600 bg-blue-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Order History
              </Link>
              <Link
                href="#"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded"
              >
                Loyalty
              </Link>
            </nav>

            <div className="mt-12">
              <button className="text-gray-600 cursor-pointer hover:text-gray-800 text-sm" onClick={()=>{
                logout();
                router.push('/');
              }}>
                Log out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
import { FC, ReactNode } from 'react';
import '../globals.css';
import Sidebar from './components/Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <html>
    <body>
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <Sidebar />
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
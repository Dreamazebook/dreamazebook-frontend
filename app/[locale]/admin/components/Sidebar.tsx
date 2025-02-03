import Link from 'next/link';
import { FC } from 'react';

const Sidebar: FC = () => {
  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Orders', href: '/admin/orders', icon: '📦' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
    // Add more menu items as needed
  ];

  return (
    <nav className="h-full py-6">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
      </div>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar; 
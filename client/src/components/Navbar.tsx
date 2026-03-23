import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/inventories', label: '查看库存', icon: '📚' },
  { path: '/timeline', label: '东西轨迹', icon: '📅' },
  { path: '/settings', label: '我的东西', icon: '👤' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:top-0 md:bottom-auto md:border-b md:border-t-0 z-50 shadow-lg md:shadow-none">
      <div className="max-w-md mx-auto md:max-w-full flex justify-around md:justify-start md:px-4 md:py-2 md:gap-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2.5 px-3 md:px-2 md:py-1.5 text-xs md:text-sm transition-all ${
                isActive 
                  ? 'text-indigo-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg md:text-base">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

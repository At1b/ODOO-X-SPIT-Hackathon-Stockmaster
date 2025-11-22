import React from 'react';
import { UserCircle2, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const loc = useLocation();
  const path = loc.pathname;
  const title = path.includes('/products') ? (path.includes('/edit') ? 'Edit Product' : path.includes('/add') ? 'Add Product' : 'Products') : 'Dashboard';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="md:hidden p-2 rounded-md hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{title === 'Dashboard' ? 'Overview & KPIs' : 'Manage your products'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition">Go to Operations Dashboard</button>
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shadow-sm">
            <UserCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>
    </header>
  );
}

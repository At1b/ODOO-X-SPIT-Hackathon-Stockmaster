import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Box, ArrowRightLeft, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/inventory', icon: Box, label: 'Inventory' },
        { path: '/transfers', icon: ArrowRightLeft, label: 'Transfers' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="bg-slate-900 text-white w-64 min-h-screen flex flex-col transition-all duration-300">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-indigo-500">IMS</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-left text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { TransfersPage } from './pages/TransfersPage';
import { initSocket } from './services/socket';
import { ThemeToggle } from './components/ThemeToggle';
import { useThemeStore } from './store/themeStore';
import { Package, ArrowDownCircle, ArrowRightLeft } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: '/operations/receipts', label: 'Receipts', icon: Package, color: 'text-blue-600' },
    { path: '/operations/delivery', label: 'Delivery Orders', icon: ArrowDownCircle, color: 'text-purple-600' },
    { path: '/operations/transfers', label: 'Internal Transfers', icon: ArrowRightLeft, color: 'text-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">StockMaster</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Operations Module</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium ${
                      isActive
                        ? `bg-gradient-to-r ${item.path.includes('receipt') ? 'from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800' : item.path.includes('delivery') ? 'from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800' : 'from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800'} ${item.color} dark:text-white shadow-sm`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme
    setTheme(theme);

    // Initialize Socket.IO connection (will handle errors gracefully)
    try {
      initSocket();
    } catch (error) {
      console.warn('Failed to initialize Socket.IO:', error);
      // App will continue to work without real-time updates
    }

    return () => {
      // Cleanup on unmount
      try {
        const { getSocket, disconnectSocket } = require('./services/socket');
        disconnectSocket();
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [theme, setTheme]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/operations/receipts" replace />} />
          <Route path="/operations/receipts" element={<ReceiptsPage />} />
          <Route path="/operations/delivery" element={<DeliveryPage />} />
          <Route path="/operations/transfers" element={<TransfersPage />} />
          <Route path="*" element={<Navigate to="/operations/receipts" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

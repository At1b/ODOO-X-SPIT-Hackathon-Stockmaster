import { Home, Package, Warehouse } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Products', url: '/products', icon: Package },
];

export function AppSidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  return (
    <>
      {/* Desktop sidebar */}
  <aside className="w-60 min-h-screen hidden md:flex flex-col bg-gradient-to-b from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Warehouse className="h-8 w-8 text-white/90" />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">StockMaster</h1>
              <p className="text-xs text-white/80">Product Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.title}>
                <NavLink to={item.url} className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition">
                  <item.icon className="h-5 w-5 text-white/90 group-hover:text-white" />
                  <span className="flex-1">{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <div className="text-xs text-white/80">Role</div>
          <div className="text-sm font-medium">Product Management</div>
        </div>
      </aside>

      {/* Mobile off-canvas */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-gradient-to-b from-indigo-600 via-indigo-500 to-violet-600 p-4 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Warehouse className="h-8 w-8 text-white/90" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight">StockMaster</h1>
                <p className="text-xs text-white/80">Product Management</p>
              </div>
            </div>
            <nav>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.title}>
                    <NavLink to={item.url} onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition">
                      <item.icon className="h-5 w-5 text-white/90" />
                      <span>{item.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sliders,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Warehouse,
  MessageSquare,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Enforce noindex dynamically on admin pages
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'robots');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', 'noindex, nofollow');

    return () => {
      metaTag?.setAttribute('content', 'index, follow');
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Stock Inventory', path: '/admin/stock', icon: Warehouse },
    { name: 'Customer Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Website Content', path: '/admin/content', icon: FileText },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings },
    { name: 'Database SQL', path: '/admin/sql', icon: Database },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-[#1E2A44]">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1E2A44] text-white shrink-0 border-r border-[#1E2A44]">
        
        {/* Brand Lockup */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8553A] flex items-center justify-center font-heading font-extrabold text-sm">
              P
            </div>
            <div>
              <span className="font-heading font-bold text-sm block">Princely's Tech</span>
              <span className="text-[11px] text-white/50 block">Management Hub</span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#E8553A] text-white font-bold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with user info & logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-[11px] text-white/70 truncate">
            <p className="font-semibold text-white">{admin?.fullName || 'Administrator'}</p>
            <p className="truncate text-white/50">{admin?.email}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <Link
              to="/"
              target="_blank"
              className="text-xs text-white/70 hover:text-white flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Store</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#1E2A44] text-white px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#E8553A] flex items-center justify-center font-bold text-xs">P</div>
          <span className="font-heading font-bold text-sm">Princely Admin</span>
        </div>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg text-white hover:bg-white/10"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#1E2A44] text-white px-4 py-4 space-y-2 border-b border-white/10 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-[#E8553A] text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <Link to="/" className="text-xs text-white/70 hover:text-white">View Store</Link>
            <button onClick={handleLogout} className="text-xs text-red-300 font-semibold">Logout</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 max-w-7xl">
        {children}
      </main>

    </div>
  );
};

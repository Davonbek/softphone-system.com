import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, UserPlus, BarChart3, Users, LogOut, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
}

export default function AdminLayout({ children, currentPage, onNavigate, onSignOut }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  const handleNavigation = (page: string) => {
    if (currentPage === 'dashboard' && page === 'dashboard') {
      setSidebarOpen(!sidebarOpen);
    } else {
      onNavigate(page);
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'register', icon: UserPlus, label: 'Register Employee' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'employees', icon: Users, label: 'Employees' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-20 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full items-center py-6">
          {/* Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="mb-8 p-3 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-700" />
          </button>

          {/* Navigation Items */}
          <nav className="flex-1 w-full px-3 space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full p-4 rounded-xl transition-all flex items-center justify-center group relative ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full p-4 mx-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => handleNavigation('dashboard')}
                className="flex items-center gap-3 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-lg">
                  <Menu className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-lg font-bold text-slate-900">Admin Portal</h1>
                  <p className="text-xs text-slate-600">Welcome, {user?.username}</p>
                </div>
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Register Employee
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

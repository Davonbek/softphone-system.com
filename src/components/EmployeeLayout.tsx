import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, BarChart3, Users, LogOut, Menu, X } from 'lucide-react';

interface EmployeeLayoutProps {
  children: React.ReactNode;
  onSignOut: () => void;
  canSignOut?: boolean;
}

export default function EmployeeLayout({ children, onSignOut, canSignOut = false }: EmployeeLayoutProps) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'profile', icon: Users, label: 'Profile' },
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
              return (
                <button
                  key={item.id}
                  className="w-full p-4 rounded-xl transition-all flex items-center justify-center text-slate-600 hover:bg-slate-100"
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
            disabled={!canSignOut}
            className={`w-full p-4 mx-3 rounded-xl transition-colors flex items-center justify-center ${
              canSignOut
                ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                : 'text-slate-300 cursor-not-allowed opacity-50'
            }`}
            title={canSignOut ? 'Logout' : 'Set status to Gone Home to sign out'}
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
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-lg">
                  <Menu className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-lg font-bold text-slate-900">Employee Portal</h1>
                  <p className="text-xs text-slate-600">Welcome, {user?.username}</p>
                </div>
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

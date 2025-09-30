import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Dashboard from './Dashboard';
import RegisterEmployee from './RegisterEmployee';
import EmployeesPage from './EmployeesPage';

interface AdminDashboardProps {
  onSignOut: () => void;
}

export default function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterEmployee />;
      case 'analytics':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-slate-900">Analytics</h2>
            <p className="text-slate-600 mt-2">Analytics page coming soon...</p>
          </div>
        );
      case 'employees':
        return <EmployeesPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onSignOut={onSignOut}
    >
      {renderPage()}
    </AdminLayout>
  );
}

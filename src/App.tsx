import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './pages/SignIn';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

type Page = 'signin' | 'admin' | 'employee';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('signin');

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        setCurrentPage('admin');
      } else if (user.role === 'employee') {
        setCurrentPage('employee');
      }
    } else if (!loading && !user) {
      setCurrentPage('signin');
    }
  }, [user, loading]);

  const handleSignInSuccess = (role: 'admin' | 'employee') => {
    setCurrentPage(role === 'admin' ? 'admin' : 'employee');
  };

  const handleSignOut = () => {
    setCurrentPage('signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentPage === 'admin' && user?.role === 'admin') {
    return <AdminDashboard onSignOut={handleSignOut} />;
  }

  if (currentPage === 'employee' && user?.role === 'employee') {
    return <EmployeeDashboard onSignOut={handleSignOut} />;
  }

  return <SignIn onSignInSuccess={handleSignInSuccess} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

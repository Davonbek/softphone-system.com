import { useState, useEffect } from 'react';
import { BarChart3, Users, UserPlus, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

interface Employee {
  id: string;
  username: string;
  created_at: string;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: employees, error } = await supabase
        .from('users')
        .select('id, username, created_at')
        .eq('role', 'employee')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dashboard data:', error);
        return;
      }

      if (employees) {
        setTotalEmployees(employees.length);

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonthCount = employees.filter(
          (emp) => new Date(emp.created_at) >= firstDayOfMonth
        ).length;
        setNewThisMonth(newThisMonthCount);

        setRecentActivity(employees.slice(0, 4));
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600 mt-1">Overview of your admin portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{loading ? '...' : totalEmployees}</h3>
          <p className="text-sm text-slate-600 mt-1">Total Employees</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +8%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{loading ? '...' : newThisMonth}</h3>
          <p className="text-sm text-slate-600 mt-1">New This Month</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +24%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">89%</h3>
          <p className="text-sm text-slate-600 mt-1">Active Rate</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +5%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">95%</h3>
          <p className="text-sm text-slate-600 mt-1">Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {employee.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{employee.username}</p>
                      <p className="text-xs text-slate-600">registered</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{getTimeAgo(employee.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('register')}
              className="w-full p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors text-left flex items-center gap-3"
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Register New Employee</span>
            </button>
            <button
              onClick={() => onNavigate('employees')}
              className="w-full p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-left flex items-center gap-3"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">View All Employees</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="w-full p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-left flex items-center gap-3"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

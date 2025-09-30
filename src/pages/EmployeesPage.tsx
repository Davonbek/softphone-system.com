import { useState, useEffect } from 'react';
import { Users, Search, CircleUser as UserCircle, CreditCard as Edit2, Eye, EyeOff, X, Save, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  username: string;
  password_hash: string;
  email: string | null;
  role: string;
  created_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'employee')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Failed to load employees');
        return;
      }

      setEmployees(data || []);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditing = (employee: Employee) => {
    setEditingId(employee.id);
    setEditUsername(employee.username);
    setEditPassword(employee.password_hash);
    setUpdateError('');
    setUpdateSuccess('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditUsername('');
    setEditPassword('');
    setUpdateError('');
    setUpdateSuccess('');
  };

  const saveChanges = async (employeeId: string) => {
    if (!editUsername.trim() || !editPassword.trim()) {
      setUpdateError('Username and password are required');
      return;
    }

    if (editPassword.length < 6) {
      setUpdateError('Password must be at least 6 characters');
      return;
    }

    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: editUsername,
          password_hash: editPassword
        })
        .eq('id', employeeId);

      if (updateError) {
        if (updateError.code === '23505') {
          setUpdateError('Username already exists');
        } else {
          setUpdateError('Failed to update employee');
        }
        return;
      }

      setUpdateSuccess('Employee updated successfully');
      await fetchEmployees();
      setTimeout(() => {
        cancelEditing();
      }, 1500);
    } catch (err) {
      setUpdateError('An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setEmployeeToDelete(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', employeeToDelete.id);

      if (deleteError) {
        setUpdateError('Failed to delete employee');
        return;
      }

      setUpdateSuccess('Employee deleted successfully');
      await fetchEmployees();
      closeDeleteModal();
    } catch (err) {
      setUpdateError('An unexpected error occurred');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-slate-900 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Employees</h2>
            <p className="text-slate-600 mt-1">Manage and view all registered employees</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-4">Loading employees...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600">
              {searchTerm ? 'No employees found matching your search' : 'No employees registered yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{employee.username}</p>
                          <p className="text-xs text-slate-500">ID: {employee.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === employee.id ? (
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm"
                          placeholder="Username"
                        />
                      ) : (
                        <p className="text-sm text-slate-900">{employee.username}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === employee.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type={showPasswords[employee.id] ? 'text' : 'password'}
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm"
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(employee.id)}
                            className="text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            {showPasswords[employee.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-slate-900">
                            {showPasswords[employee.id] ? employee.password_hash : '•'.repeat(employee.password_hash.length)}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(employee.id)}
                            className="text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            {showPasswords[employee.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{formatDate(employee.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === employee.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveChanges(employee.id)}
                            disabled={updating}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
                          >
                            <Save className="w-4 h-4" />
                            {updating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={updating}
                            className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(employee)}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-sm font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(employee)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredEmployees.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            {updateError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {updateError}
              </div>
            )}
            {updateSuccess && (
              <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
                {updateSuccess}
              </div>
            )}
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredEmployees.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{employees.length}</span> employees
            </p>
          </div>
        )}
      </div>

      {deleteModalOpen && employeeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Delete Employee</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{employeeToDelete.username}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

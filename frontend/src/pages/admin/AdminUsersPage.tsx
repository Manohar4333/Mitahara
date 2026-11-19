import React, { useEffect, useState } from 'react';
import { Search, Eye, X, RefreshCw, Users, Shield, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAppDispatch } from '../../store/index.js';
import { showToast } from '../../store/slices/uiSlice.js';

export const AdminUsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // User Detail Modal
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', {
        params: { page: pageNum, limit: 10, search, role },
      });
      setUsers(res.data.data);
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Failed to fetch users' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [search, role]);

  const handleViewUser = async (userId: string) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data.data);
    } catch (err) {
      dispatch(showToast({ type: 'error', message: 'Could not fetch user details' }));
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
          Customer & Staff Directory
        </span>
        <h2 className="text-2xl font-serif font-black text-slate-900">
          User Management ({total})
        </h2>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">Customers Only</option>
            <option value="admin">Administrators Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Marketing Consent</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
                    <span>Loading directory...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.location || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.marketingConsent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {u.marketingConsent ? 'Consented' : 'Declined'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{u.orderCount || 0}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewUser(u.id)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="View user details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchUsers(i + 1)}
                  className={`w-7 h-7 rounded-lg font-bold ${page === i + 1 ? 'bg-emerald-700 text-white' : 'hover:bg-slate-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-serif font-bold text-slate-900">User Profile Details</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-xl font-bold shrink-0">
                  {selectedUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedUser.name}</h4>
                  <p className="text-slate-500">{selectedUser.email}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-0.5">Total Orders</span>
                  <span className="text-lg font-bold text-slate-900">{selectedUser.orderCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block mb-0.5">Total Spent</span>
                  <span className="text-lg font-bold text-emerald-800">₹{selectedUser.totalSpent}</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-600">
                <p><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</p>
                <p><strong>City / Location:</strong> {selectedUser.location || 'Not provided'}</p>
                <p><strong>PIN Code:</strong> {selectedUser.pinCode || 'Not provided'}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Marketing Consent:</strong> {selectedUser.marketingConsent ? 'Yes (Opted In)' : 'No (Opted Out)'}</p>
                <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

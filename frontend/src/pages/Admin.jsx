// Admin.jsx
import React, { useState, useEffect } from 'react';
import { getAllUsers, createAdmin } from '../services/api';
import { Users, UserPlus, X, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await createAdmin(newAdmin);
      setShowCreateForm(false);
      setNewAdmin({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'text-red-600 bg-red-100';
      case 'interviewer': return 'text-blue-600 bg-blue-100';
      case 'candidate': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role) => {
    return role === 'super_admin' || role === 'interviewer' ? (
      <Shield size={16} className="mr-1" />
    ) : (
      <Users size={16} className="mr-1" />
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <UserPlus size={16} className="mr-2" />
              Create Admin
            </button>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="text-blue-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Candidates</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'candidate').length}
                  </p>
                </div>
                <Users className="text-green-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Interviewers</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'interviewer').length}
                  </p>
                </div>
                <Shield className="text-blue-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Admins</p>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'super_admin').length}
                  </p>
                </div>
                <Shield className="text-red-500" size={32} />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold">All Users</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Questions Solved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.questionsSolved || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Admin Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create Admin</h2>
                <button onClick={() => setShowCreateForm(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateAdmin}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export {Admin }
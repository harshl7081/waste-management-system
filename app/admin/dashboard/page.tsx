'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  totalWaste: number;
  recyclingRate: number;
  pointsEarned: number;
  activities: Activity[];
}

interface Activity {
  _id: string;
  type: string;
  details: any;
  timestamp: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
      setLoading(false);
    } catch (err) {
      setError('Error loading users');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User List */}
          <div className="col-span-1 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?._id === user._id
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">Role: {user.role}</span>
                      <span className="text-green-600">{user.pointsEarned} points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="col-span-2 space-y-8">
            {selectedUser ? (
              <>
                {/* User Stats */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">User Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Total Waste</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                          {selectedUser.totalWaste}kg
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Recycling Rate</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                          {selectedUser.recyclingRate}%
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Points Earned</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                          {selectedUser.pointsEarned}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity History */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Activity History</h2>
                    <div className="space-y-4">
                      {selectedUser.activities.map((activity) => (
                        <div key={activity._id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{activity.type}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <button
                              className="text-sm text-blue-600 hover:text-blue-800"
                              onClick={() => {/* View details */}}
                            >
                              View Details
                            </button>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {JSON.stringify(activity.details, null, 2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* User Actions */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">User Actions</h2>
                    <div className="space-x-4">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        onClick={() => {/* Handle suspend */}}
                      >
                        Suspend User
                      </button>
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => {/* Handle reset */}}
                      >
                        Reset Password
                      </button>
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        onClick={() => {/* Handle edit */}}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a user to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
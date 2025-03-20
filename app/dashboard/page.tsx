'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  activeBins: number;
  properlySegregated: number;
  avgCollectionTime: number;
  pointsEarned: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeBins: 0,
    properlySegregated: 0,
    avgCollectionTime: 0,
    pointsEarned: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(error => console.error('Error fetching dashboard stats:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Smart Waste Management Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Bins</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeBins}</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Properly Segregated</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.properlySegregated}%</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Avg. Collection Time</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgCollectionTime} hrs</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Points Earned</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.pointsEarned}</dd>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link 
              href="/classification"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Upload Waste Image
            </Link>
            <Link
              href="/monitoring"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Report Area
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Schedule Pickup
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-500">No recent activities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
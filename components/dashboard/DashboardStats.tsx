'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface Stat {
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease';
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([
    {
      name: 'Total Waste Collected',
      value: 0,
      unit: 'kg',
      change: 0,
      changeType: 'increase',
    },
    {
      name: 'Recyclable Waste',
      value: 0,
      unit: 'kg',
      change: 0,
      changeType: 'increase',
    },
    {
      name: 'Non-Recyclable Waste',
      value: 0,
      unit: 'kg',
      change: 0,
      changeType: 'increase',
    },
    {
      name: 'Recycling Rate',
      value: 0,
      unit: '%',
      change: 0,
      changeType: 'increase',
    },
  ]);

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className="absolute rounded-md bg-green-500 p-3">
              {stat.changeType === 'increase' ? (
                <ArrowUpIcon className="h-6 w-6 text-white" aria-hidden="true" />
              ) : (
                <ArrowDownIcon className="h-6 w-6 text-white" aria-hidden="true" />
              )}
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">
              {stat.value}
              {stat.unit}
            </p>
            <p
              className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.changeType === 'increase'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {stat.changeType === 'increase' ? (
                <ArrowUpIcon
                  className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                  aria-hidden="true"
                />
              ) : (
                <ArrowDownIcon
                  className="h-5 w-5 flex-shrink-0 self-center text-red-500"
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">
                {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
              </span>
              {stat.change}%
            </p>
          </dd>
        </div>
      ))}
    </div>
  );
} 
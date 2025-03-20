'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface WasteBin {
  _id: string;
  binId: string;
  location: string;
  fillLevel: number;
  lastEmptied: string;
  status: 'active' | 'inactive' | 'maintenance';
  type: 'general' | 'recyclable' | 'organic';
}

export default function Monitoring() {
  const router = useRouter();
  const [wasteBins, setWasteBins] = useState<WasteBin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBin, setSelectedBin] = useState<WasteBin | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    fetchWasteBins();
  }, []);

  const fetchWasteBins = async () => {
    try {
      const response = await fetch('/api/wastebins');
      if (!response.ok) {
        throw new Error('Failed to fetch waste bins');
      }
      const data = await response.json();
      setWasteBins(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFillLevel = async (binId: string, newLevel: number) => {
    try {
      const response = await fetch(`/api/wastebins/${binId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fillLevel: newLevel }),
      });

      if (!response.ok) {
        throw new Error('Failed to update fill level');
      }

      // Update local state
      setWasteBins(bins =>
        bins.map(bin =>
          bin._id === binId ? { ...bin, fillLevel: newLevel } : bin
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFillLevelColor = (level: number) => {
    if (level >= 80) return 'text-red-600';
    if (level >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Waste Bin Monitoring</h1>
          <p className="mt-2 text-gray-600">Monitor and manage waste bins across locations</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900">Total Bins</h2>
            <p className="text-3xl font-bold text-green-600">{wasteBins.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900">Critical Fill Level</h2>
            <p className="text-3xl font-bold text-red-600">
              {wasteBins.filter(bin => bin.fillLevel >= 80).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900">Active Bins</h2>
            <p className="text-3xl font-bold text-blue-600">
              {wasteBins.filter(bin => bin.status === 'active').length}
            </p>
          </div>
        </div>

        {/* Waste Bins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wasteBins.map((bin) => (
            <div key={bin._id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bin {bin.binId}
                    </h3>
                    <p className="text-sm text-gray-500">{bin.location}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      bin.status
                    )}`}
                  >
                    {bin.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-500">Fill Level</span>
                      <span className={`text-sm font-semibold ${getFillLevelColor(bin.fillLevel)}`}>
                        {bin.fillLevel}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 ${
                          bin.fillLevel >= 80
                            ? 'bg-red-500'
                            : bin.fillLevel >= 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${bin.fillLevel}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Last Emptied</span>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(bin.lastEmptied).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Type</span>
                    <p className="text-sm font-medium text-gray-900 capitalize">{bin.type}</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBin(bin);
                      setIsUpdateModalOpen(true);
                    }}
                    className="w-full mt-4 bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Update Fill Level
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Fill Level Modal */}
      {isUpdateModalOpen && selectedBin && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Fill Level - Bin {selectedBin.binId}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Fill Level: {selectedBin.fillLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedBin.fillLevel}
                  onChange={(e) => {
                    const newLevel = parseInt(e.target.value);
                    setSelectedBin({ ...selectedBin, fillLevel: newLevel });
                  }}
                  className="w-full mt-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateFillLevel(selectedBin._id, selectedBin.fillLevel);
                    setIsUpdateModalOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
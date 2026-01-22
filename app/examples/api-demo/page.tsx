'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { apartmentsApi, roomsApi } from '@/lib/api';
import { Apartment, Room } from '@/lib/types/api';
import { formatCurrency } from '@/lib/utils/api-helpers';
import { getUserRoleName } from '@/lib/utils/role-helpers';

/**
 * API Integration Demo Page
 * 
 * This page demonstrates how to use the API integration layer
 * with authentication, data fetching, and error handling.
 */
export default function ApiDemoPage() {
  const { user, login, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Fetch apartments using the useApi hook
  const {
    data: apartmentsResponse,
    loading: apartmentsLoading,
    error: apartmentsError,
    execute: fetchApartments,
  } = useApi(apartmentsApi.getAll);

  // Fetch rooms
  const {
    data: roomsResponse,
    loading: roomsLoading,
    error: roomsError,
    execute: fetchRooms,
  } = useApi(roomsApi.getAll);

  // Fetch data on component mount
  const loadData = useCallback(() => {
    fetchApartments({ page: 1, per_page: 5 });
    fetchRooms({ page: 1, per_page: 10, status: 'available' });
  }, [fetchApartments, fetchRooms]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      alert('Login successful!');
    } catch (error) {
      alert(`Login failed: ${(error as Error).message}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    alert('Logged out successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          API Integration Demo
        </h1>

        {/* Authentication Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Authentication Status
          </h2>
          
          {authLoading ? (
            <p className="text-gray-600">Checking authentication...</p>
          ) : isAuthenticated ? (
            <div>
              <p className="text-green-600 mb-2">
                ✓ Authenticated as: <strong>{user?.email}</strong>
              </p>
              <p className="text-gray-600 mb-2">Name: {user?.name}</p>
              <p className="text-gray-600 mb-4">
                Role: {getUserRoleName(user)}
              </p>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Not authenticated</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Login
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Apartments Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Apartments (Public API)
          </h2>
          
          {apartmentsLoading && (
            <p className="text-gray-600">Loading apartments...</p>
          )}
          
          {apartmentsError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800">Error: {apartmentsError.message}</p>
            </div>
          )}
          
          {apartmentsResponse && (
            <div>
              <p className="text-gray-600 mb-4">
                Showing {apartmentsResponse.data.length} of {apartmentsResponse.total} apartments
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apartmentsResponse.data.map((apartment: Apartment) => (
                  <div
                    key={apartment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                  >
                    <h3 className="font-semibold text-lg mb-2">{apartment.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{apartment.address}</p>
                    <p className="text-gray-600 text-sm mb-2">{apartment.location}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {apartment.available_rooms} / {apartment.total_rooms} available
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          apartment.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {apartment.is_active ? 'active' : 'inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rooms Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Available Rooms (Public API)
          </h2>
          
          {roomsLoading && (
            <p className="text-gray-600">Loading rooms...</p>
          )}
          
          {roomsError && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800">Error: {roomsError.message}</p>
            </div>
          )}
          
          {roomsResponse && (
            <div>
              <p className="text-gray-600 mb-4">
                Showing {roomsResponse.data.length} of {roomsResponse.total} rooms
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomsResponse.data.map((room: Room) => (
                  <div
                    key={room.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{room.room_number}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          room.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 capitalize">
                      {room.room_type.replace('_', ' ')}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      {formatCurrency(room.price_per_month || room.actual_price || 0)} / month
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      {room.floor && <p>Floor: {room.floor}</p>}
                      {room.size_sqm && <p>Size: {room.size_sqm} sqm</p>}
                      {room.allowed_gender !== 'any' && (
                        <p className="capitalize">Gender: {room.allowed_gender}</p>
                      )}
                    </div>
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{room.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* API Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📘 API Integration Info
          </h3>
          <p className="text-blue-800 text-sm mb-2">
            This demo page showcases the API integration layer. Features:
          </p>
          <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
            <li>Authentication with useAuth hook</li>
            <li>Data fetching with useApi hook</li>
            <li>Automatic error handling</li>
            <li>Loading states</li>
            <li>TypeScript type safety</li>
          </ul>
          <p className="text-blue-800 text-sm mt-4">
            API Base URL: <code className="bg-blue-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}

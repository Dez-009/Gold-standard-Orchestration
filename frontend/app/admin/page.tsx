'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, isAdmin } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';
import { fetchSystemMetrics } from '../../services/systemMetricsService';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }

    if (!isAdmin()) {
      showError('Admin access required');
      router.push('/dashboard');
      return;
    }

    loadMetrics();
  }, [router]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSystemMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/users" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">User Management</h3>
              <p className="text-gray-600 mt-1">View and manage user accounts</p>
            </div>
            <div className="text-blue-500 text-4xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          {metrics && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Users:</span>
                <span className="text-gray-900 font-medium">{metrics.user_count || '—'}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500">Active Today:</span>
                <span className="text-gray-900 font-medium">{metrics.active_users_today || '—'}</span>
              </div>
            </div>
          )}
        </Link>
        
        <Link href="/admin/analytics" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Analytics</h3>
              <p className="text-gray-600 mt-1">Usage statistics and metrics</p>
            </div>
            <div className="text-green-500 text-4xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          {metrics && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">API Requests Today:</span>
                <span className="text-gray-900 font-medium">{metrics.api_requests_today || '—'}</span>
              </div>
            </div>
          )}
        </Link>
        
        <Link href="/admin/subscriptions" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Subscriptions</h3>
              <p className="text-gray-600 mt-1">Manage user subscriptions</p>
            </div>
            <div className="text-purple-500 text-4xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {metrics && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Active Subscriptions:</span>
                <span className="text-gray-900 font-medium">{metrics.active_subscriptions || '—'}</span>
              </div>
            </div>
          )}
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/admin/users" 
            className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-center font-medium"
          >
            Manage Users
          </Link>
          <Link 
            href="/admin/impersonation" 
            className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-center font-medium"
          >
            Impersonate User
          </Link>
          <Link 
            href="/admin/system-logs" 
            className="px-4 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition text-center font-medium"
          >
            View System Logs
          </Link>
        </div>
      </div>
    </div>
  );
}

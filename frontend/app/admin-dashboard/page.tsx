'use client';
// Admin Dashboard - Comprehensive overview for administrators
// Temporary location due to Next.js routing issue with /admin/dashboard

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getToken,
  parseUserFromToken,
  isTokenExpired
} from '../../services/authUtils';
import { isAdmin } from '../../services/roleService';
import { showError } from '../../components/ToastProvider';

export default function AdminDashboard() {
  const [user, setUser] = useState<{ email: string | null; role: string | null }>({ email: null, role: null });
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

    const userInfo = parseUserFromToken(token);
    if (userInfo.role !== 'admin') {
      showError('Admin access required');
      router.push('/dashboard');
      return;
    }

    setUser(userInfo);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      links: [
        { label: 'All Users', href: '/admin/users', description: 'View and manage all users with role controls' },
        { label: 'User Sessions', href: '/admin/sessions', description: 'Active user sessions' },
      ]
    },
    {
      title: 'System Monitoring',
      description: 'Monitor system health and performance',
      links: [
        { label: 'System Health', href: '/admin/health', description: 'Overall system status' },
        { label: 'Metrics', href: '/admin/metrics', description: 'Performance metrics and analytics' },
        { label: 'Error Monitoring', href: '/admin/errors', description: 'System errors and issues' },
        { label: 'Audit Logs', href: '/admin/audit', description: 'System audit trail' },
      ]
    },
    {
      title: 'Content Management',
      description: 'Manage content and user-generated data',
      links: [
        { label: 'Journal Entries', href: '/admin/journals', description: 'Review journal entries' },
        { label: 'Flagged Content', href: '/admin/flagged-summaries', description: 'Review flagged content' },
        { label: 'Feedback', href: '/admin/feedback', description: 'User feedback and reports' },
        { label: 'Notifications', href: '/admin/notifications', description: 'System notifications' },
      ]
    },
    {
      title: 'AI & Agents',
      description: 'Manage AI agents and configurations',
      links: [
        { label: 'Agent Management', href: '/admin/agents', description: 'AI agent controls' },
        { label: 'Agent Logs', href: '/admin/agent-logs', description: 'Agent execution logs' },
        { label: 'Agent Failures', href: '/admin/agent-failures', description: 'Failed agent executions' },
        { label: 'Orchestration', href: '/admin/orchestration', description: 'Agent orchestration monitoring' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-red-600">
                Vida Coach Admin
              </Link>
              <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Switch to User Dashboard
              </Link>
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {user.email}. Here's your system overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-gray-900">---</p>
            <p className="text-xs text-gray-500">Last 24 hours</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">System Status</h3>
            <p className="text-2xl font-bold text-green-600">Healthy</p>
            <p className="text-xs text-gray-500">All systems operational</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Issues</h3>
            <p className="text-2xl font-bold text-yellow-600">---</p>
            <p className="text-xs text-gray-500">Require attention</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <p className="text-2xl font-bold text-blue-600">---</p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {adminSections.map((section) => (
            <div key={section.title} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {section.description}
                </p>
              </div>
              <div className="space-y-3">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {link.label}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {link.description}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">👥</div>
              <p className="font-medium text-blue-700">Create User</p>
            </button>
            <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">🔧</div>
              <p className="font-medium text-green-700">System Check</p>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-yellow-700">Export Data</p>
            </button>
            <button className="p-4 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors">
              <div className="text-2xl mb-2">🚨</div>
              <p className="font-medium text-red-700">Emergency</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

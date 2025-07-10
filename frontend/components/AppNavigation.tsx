'use client';
// Main Navigation Component - Role-based navigation for the application
// Displays different navigation items based on user role

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUserRole, isAdmin } from '../services/roleService';
import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  description?: string;
  adminOnly?: boolean;
}

const userNavItems: NavItem[] = [
  { label: 'AI Coach', href: '/coach', description: 'Chat with your AI coach' },
  { label: 'Orchestration Demo', href: '/orchestration', description: 'Multi-agent coaching demo' },
  { label: 'Goals', href: '/user/goals', description: 'Manage your goals' },
  { label: 'Goal Progress', href: '/user/goals/progress', description: 'Track goal progress' },
  { label: 'Journal History', href: '/journal/history', description: 'View your journal entries' },
  { label: 'Daily Check-In', href: '/checkin', description: 'Complete daily check-in' },
  { label: 'Mood Tracker', href: '/mood', description: 'Track your mood' },
  { label: 'Mood Trends', href: '/mood/trends', description: 'View mood analytics' },
  { label: 'Weekly Review', href: '/review', description: 'Review your week' },
  { label: 'Suggestions', href: '/suggestions', description: 'AI-powered suggestions' },
  { label: 'Sessions', href: '/sessions', description: 'Coaching session history' },
  { label: 'Profile Settings', href: '/profile', description: 'Manage your profile' },
  { label: 'Account', href: '/account', description: 'Account & billing' },
];

const adminNavItems: NavItem[] = [
  { label: 'Admin Dashboard', href: '/admin/dashboard', description: 'Admin control panel', adminOnly: true },
  { label: 'User Management', href: '/admin/users', description: 'Manage users', adminOnly: true },
  { label: 'System Health', href: '/admin/health', description: 'Monitor system status', adminOnly: true },
  { label: 'Audit Logs', href: '/admin/audit', description: 'System audit logs', adminOnly: true },
  { label: 'Metrics', href: '/admin/metrics', description: 'Performance metrics', adminOnly: true },
  { label: 'Agent Management', href: '/admin/agents', description: 'AI agent controls', adminOnly: true },
  { label: 'Billing', href: '/admin/billing', description: 'Billing management', adminOnly: true },
  { label: 'Configuration', href: '/admin/config', description: 'System configuration', adminOnly: true },
];

interface AppNavigationProps {
  currentRole?: string;
  showHeader?: boolean;
  className?: string;
}

export default function AppNavigation({ 
  currentRole, 
  showHeader = true, 
  className = '' 
}: AppNavigationProps) {
  const [user, setUser] = useState<{ email: string | null; role: string | null }>({ email: null, role: null });
  const router = useRouter();

  useEffect(() => {
    const userInfo = getCurrentUserRole();
    setUser(userInfo);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isUserAdmin = isAdmin();
  const displayItems = [...userNavItems];
  
  if (isUserAdmin) {
    displayItems.push(...adminNavItems);
  }

  return (
    <div className={`bg-white shadow-sm border-b ${className}`}>
      {showHeader && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Vida Coach
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email} ({user.role || 'user'})
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
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                item.adminOnly ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${
                    item.adminOnly ? 'text-red-700' : 'text-gray-900'
                  }`}>
                    {item.label}
                    {item.adminOnly && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="text-gray-400">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

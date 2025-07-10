'use client';
// Main landing page - Routes authenticated users to appropriate dashboard
// Shows welcome page for unauthenticated users

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getCurrentUserRole, getDashboardRoute } from '../services/roleService';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      const user = getCurrentUserRole();
      const dashboardRoute = getDashboardRoute(user.role);
      router.push(dashboardRoute);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-blue-600">Vida Coach</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Your AI-powered personal coaching companion for goals, mindfulness, and personal growth.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold mb-2">AI Coaching</h3>
              <p className="text-gray-600">
                Get personalized guidance from our advanced AI coaching system.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Goal Tracking</h3>
              <p className="text-gray-600">
                Set, track, and achieve your personal and professional goals.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Progress Analytics</h3>
              <p className="text-gray-600">
                Visualize your growth with detailed analytics and insights.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link
              href="/register"
              className="inline-block w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started - Create Account
            </Link>
            <Link
              href="/login"
              className="inline-block w-full md:w-auto px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Demo Info */}
          <div className="mt-8 p-4 bg-white/70 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Try our demo accounts:</strong>
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>User Demo:</strong> user@demo.com / password123</p>
              <p><strong>Admin Demo:</strong> admin@demo.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

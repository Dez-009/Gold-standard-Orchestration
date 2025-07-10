'use client';
// Protected Route Component - Handles authentication and role-based access control
// Automatically redirects users based on their authentication status and role

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, hasRequiredRole, getCurrentUserRole, getDashboardRoute } from '../services/roleService';
import { showError } from './ToastProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo 
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        showError('Please log in to access this page');
        router.push('/login');
        return;
      }

      // Check role requirements
      if (requiredRole && !hasRequiredRole(requiredRole)) {
        const user = getCurrentUserRole();
        showError(`Access denied. ${requiredRole} privileges required.`);
        
        // Redirect to appropriate dashboard or custom route
        const fallbackRoute = redirectTo || getDashboardRoute(user.role || undefined);
        router.push(fallbackRoute);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRole, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

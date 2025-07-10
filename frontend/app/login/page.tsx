// Page implementing the login form
// Uses AuthForm component to submit credentials to backend
// Redirects users to appropriate dashboard based on role

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import { loginUser, getCurrentUser } from '../../services/authService';
import { trackEvent } from '../../services/analyticsService';
import { parseUserFromToken } from '../../services/authUtils';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Handler passed to AuthForm for submission
  const handleLogin = async (values: Record<string, string>) => {
    setIsLoading(true);
    try {
      const data = await loginUser({
        email: values.email,
        password: values.password
      });

      // Store JWT token in localStorage
      localStorage.setItem('token', data.access_token);

      // Parse user role from token
      const userInfo = parseUserFromToken(data.access_token);
      const userRole = userInfo.role;

      // Track successful login event
      trackEvent('login', { 
        email: values.email,
        role: userRole 
      });

      // Redirect based on user role
      if (userRole === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fields required for login form
  const fields = [
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Vida Coach account</p>
        </div>

        <AuthForm 
          submitText={isLoading ? "Signing In..." : "Sign In"} 
          fields={fields} 
          onSubmit={handleLogin} 
        />

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Create one here
            </Link>
          </p>
        </div>

        {/* Demo Accounts Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Accounts</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>User:</strong> user@demo.com / password123</p>
            <p><strong>Admin:</strong> admin@demo.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

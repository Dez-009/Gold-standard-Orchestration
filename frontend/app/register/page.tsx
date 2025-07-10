// Page implementing the user registration form
// Uses AuthForm component and posts data to backend
// Supports role-based registration for users and admins

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import { registerUser } from '../../services/authService';
import { applyReferralCode } from '../../services/referralService';
import { trackEvent } from '../../services/analyticsService';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  // Handler passed to AuthForm for submission
  const handleRegister = async (values: Record<string, string>) => {
    // Verify admin code if registering as admin
    if (selectedRole === 'admin') {
      if (!adminCode || adminCode !== 'VIDA_ADMIN_2025') {
        throw new Error('Invalid admin code');
      }
    }

    const userData = await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
      role: selectedRole,
      access_code: selectedRole === 'admin' ? adminCode : undefined,
    });

    // Track registration event
    trackEvent('user_registered', { 
      email: values.email, 
      role: selectedRole 
    });

    // Notes: Apply referral code if the optional field was filled
    if (values.referral_code) {
      try {
        await applyReferralCode(values.referral_code);
      } catch {
        // Silently ignore referral errors to avoid blocking signup
      }
    }

    // Show success message and redirect to login
    alert(`${selectedRole === 'admin' ? 'Admin' : 'User'} account created successfully! Please log in.`);
    router.push('/login');
  };

  // Fields required for registration form
  const getFields = () => {
    const baseFields = [
      { name: 'name', label: 'Full Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'referral_code', label: 'Referral Code (optional)', type: 'text', required: false }
    ];

    return baseFields;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Join Vida Coach today</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('user');
                setShowAdminCode(false);
              }}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                selectedRole === 'user'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              User Account
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setShowAdminCode(true);
              }}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                selectedRole === 'admin'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Admin Account
            </button>
          </div>
        </div>

        {/* Admin Code Input */}
        {showAdminCode && (
          <div className="mb-6">
            <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Access Code
            </label>
            <input
              id="adminCode"
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Enter admin access code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required={selectedRole === 'admin'}
            />
            <p className="text-xs text-gray-500 mt-1">
              Admin access code is required to create admin accounts
            </p>
          </div>
        )}

        {/* Registration Form */}
        <AuthForm 
          submitText={`Create ${selectedRole === 'admin' ? 'Admin' : 'User'} Account`} 
          fields={getFields()} 
          onSubmit={handleRegister} 
        />

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

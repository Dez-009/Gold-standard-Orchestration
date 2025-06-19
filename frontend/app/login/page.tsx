// Page implementing the login form
// Uses AuthForm component to submit credentials to backend

'use client';
import AuthForm from '../../components/AuthForm';
import { loginUser } from '../../services/authService';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { trackEvent } from '../../services/analyticsService';

export default function LoginPage() {
  const router = useRouter(); // Router instance for navigation

  // Notes: Track that the login page was viewed
  useEffect(() => {
    trackEvent('page_view', { page: 'login' });
  }, []);

  // Handler passed to AuthForm for submission
  const handleLogin = async (values: Record<string, string>) => {
    const data = await loginUser({
      email: values.email,
      password: values.password
    });
    // Notes: Log successful login event
    trackEvent('login', { email: values.email });
    // Store JWT token in localStorage temporarily
    localStorage.setItem('token', data.access_token);
    // Navigate to dashboard after successful login
    router.push('/dashboard');
  };

  // Fields required for login form
  const fields = [
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthForm submitText="Login" fields={fields} onSubmit={handleLogin} />
    </div>
  );
}

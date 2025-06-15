// Page implementing the login form
// Uses AuthForm component to submit credentials to backend

'use client';
import AuthForm from '../../components/AuthForm';
import { loginUser } from '../../services/authService';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter(); // Router instance for navigation

  // Handler passed to AuthForm for submission
  const handleLogin = async (values: Record<string, string>) => {
    const data = await loginUser({
      email: values.email,
      password: values.password
    });
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

// Page implementing the user registration form
// Uses AuthForm component and posts data to backend

'use client';
import AuthForm from '../../components/AuthForm';
import { registerUser } from '../../services/authService';

export default function RegisterPage() {
  // Handler passed to AuthForm for submission
  const handleRegister = async (values: Record<string, string>) => {
    await registerUser({
      name: values.name,
      email: values.email,
      password: values.password
    });
  };

  // Fields required for registration form
  const fields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthForm submitText="Register" fields={fields} onSubmit={handleRegister} />
    </div>
  );
}

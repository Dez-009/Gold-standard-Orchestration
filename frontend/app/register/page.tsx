// Page implementing the user registration form
// Uses AuthForm component and posts data to backend

'use client';
import AuthForm from '../../components/AuthForm';
import { registerUser } from '../../services/authService';
import { applyReferralCode } from '../../services/referralService';

export default function RegisterPage() {
  // Handler passed to AuthForm for submission
  const handleRegister = async (values: Record<string, string>) => {
    await registerUser({
      name: values.name,
      email: values.email,
      password: values.password
    });
    // Notes: Apply referral code if the optional field was filled
    if (values.referral_code) {
      try {
        await applyReferralCode(values.referral_code);
      } catch {
        // Silently ignore referral errors to avoid blocking signup
      }
    }
  };

  // Fields required for registration form
  const fields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'referral_code', label: 'Referral Code (optional)', type: 'text', required: false }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthForm submitText="Register" fields={fields} onSubmit={handleRegister} />
    </div>
  );
}

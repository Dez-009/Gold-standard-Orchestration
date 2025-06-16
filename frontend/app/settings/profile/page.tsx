'use client';
// Account profile settings page allowing users to edit personal information
// The page verifies authentication on mount and submits profile updates
// via the accountService.updateProfile helper.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateProfile } from '../../../services/accountService';
import { getToken, isTokenExpired } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

// Notes: Shape describing the form data managed by this page
interface ProfileForm {
  first_name: string;
  last_name: string;
  age: number;
  sex: string;
  marital_status: string;
  has_children: boolean;
}

export default function AccountProfileSettings() {
  const router = useRouter();
  // Notes: Initialize local state for the form fields
  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    age: 0,
    sex: 'Male',
    marital_status: 'Single',
    has_children: false
  });
  // Notes: Track network/loading state and error feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Notes: On mount ensure the user has a valid session
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
    }
  }, [router]);

  // Notes: Update local state when any input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : type === 'number' ? Number(value) : value;
    setForm({ ...form, [name]: val });
  };

  // Notes: Submit the form data to the backend via accountService
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateProfile(form as unknown as Record<string, unknown>);
      showSuccess('Profile updated');
    } catch {
      setError('Failed to save profile');
      showError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Link back to the dashboard for convenience */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      {/* Form allowing the user to edit basic personal details */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <div className="flex flex-col">
          <label htmlFor="first_name" className="mb-1 font-medium">
            First Name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            value={form.first_name}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="last_name" className="mb-1 font-medium">
            Last Name
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            value={form.last_name}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="age" className="mb-1 font-medium">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="sex" className="mb-1 font-medium">
            Sex
          </label>
          <select
            id="sex"
            name="sex"
            value={form.sex}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Nonbinary</option>
            <option>Prefer not to say</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="marital_status" className="mb-1 font-medium">
            Marital Status
          </label>
          <select
            id="marital_status"
            name="marital_status"
            value={form.marital_status}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
            <option>Widowed</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="has_children"
            name="has_children"
            type="checkbox"
            checked={form.has_children}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="has_children" className="font-medium">
            Has Children
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>

      {/* Loading spinner and error message */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}

'use client';
// Profile settings page allowing the user to view and edit personal details
// The page retrieves the current profile from the backend and updates it on save

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchUserProfile,
  updateUserProfile
} from '../../services/profileService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError, showSuccess } from '../../components/ToastProvider';

// Shape of the profile data handled by this page
interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  gender: string;
  marital_status: string;
  children: number;
}

export default function ProfilePage() {
  const router = useRouter(); // Used for navigation when the session expires

  // Local state storing all editable profile fields
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    age: 0,
    gender: 'Male',
    marital_status: 'Single',
    children: 0
  });

  // Track loading and error states for UX feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to retrieve the profile data on initial page load
  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = (await fetchUserProfile()) as UserProfile;
      setProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        age: data.age,
        gender: data.gender,
        marital_status: data.marital_status,
        children: data.children
      });
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Verify token validity and fetch profile information
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    loadProfile();
  }, [router]);

  // Update state when the user edits any field
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    setProfile({ ...profile, [name]: val });
  };

  // Submit updated profile information to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateUserProfile(profile as unknown as Record<string, unknown>);
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
      {/* Link back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Page heading */}
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      {/* Editable profile form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <div className="flex flex-col">
          <label htmlFor="first_name" className="mb-1 font-medium">
            First Name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            value={profile.first_name}
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
            value={profile.last_name}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email}
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
            value={profile.age}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="gender" className="mb-1 font-medium">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="marital_status" className="mb-1 font-medium">
            Marital Status
          </label>
          <select
            id="marital_status"
            name="marital_status"
            value={profile.marital_status}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
            <option>Widowed</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="children" className="mb-1 font-medium">
            Number of Children
          </label>
          <input
            id="children"
            name="children"
            type="number"
            value={profile.children}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </form>

      {/* Status indicators */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}


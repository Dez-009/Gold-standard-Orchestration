'use client';
// Profile management page allowing the user to view and edit personal details
// Fetches the current profile on mount and sends updates back to the backend

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchProfile, saveProfile } from '../../services/profileService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { showError } from '../../components/ToastProvider';

// Shape of the profile data used by this page
interface Profile {
  name: string;
  age: number;
  sex: string;
  marital_status: string;
  has_kids: boolean;
  kids_count?: number;
}

export default function ProfilePage() {
  const router = useRouter(); // Notes: Router used for redirects
  // Local state holding the profile fields
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: 0,
    sex: 'Male',
    marital_status: 'Single',
    has_kids: false,
    kids_count: 0
  });
  // Flags for loading, error and success indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Helper to load the profile from the backend
  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = (await fetchProfile()) as Profile;
      setProfile({
        name: data.name,
        age: data.age,
        sex: data.sex,
        marital_status: data.marital_status,
        has_kids: data.has_kids,
        kids_count: data.kids_count || 0
      });
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Notes: Validate session then load profile on first render
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

  // Update local state when form inputs change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    setProfile({ ...profile, [name]: val });
  };

  // Update has_kids flag via radio buttons
  const handleKidsChange = (value: boolean) => {
    setProfile({
      ...profile,
      has_kids: value,
      kids_count: value ? profile.kids_count : 0
    });
  };

  // Submit updated profile to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await saveProfile(profile as unknown as Record<string, unknown>);
      setSuccess(true);
    } catch {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to the dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>

      {/* Heading for the page */}
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      {/* Profile edit form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={profile.name}
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
          <label htmlFor="sex" className="mb-1 font-medium">
            Sex
          </label>
          <select
            id="sex"
            name="sex"
            value={profile.sex}
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
          <span className="mb-1 font-medium">Do you have children?</span>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                name="has_kids"
                value="yes"
                checked={profile.has_kids}
                onChange={() => handleKidsChange(true)}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                name="has_kids"
                value="no"
                checked={!profile.has_kids}
                onChange={() => handleKidsChange(false)}
              />
              <span>No</span>
            </label>
          </div>
        </div>
        {profile.has_kids && (
          <div className="flex flex-col">
            <label htmlFor="kids_count" className="mb-1 font-medium">
              Number of Kids
            </label>
            <input
              id="kids_count"
              name="kids_count"
              type="number"
              value={profile.kids_count}
              onChange={handleChange}
              className="border rounded p-2"
              required
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      </form>

      {/* Status indicators */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Profile updated!</p>}
    </div>
  );
}

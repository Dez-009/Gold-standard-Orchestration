'use client';
// Admin view for a specific user profile - placeholder for future details

import Link from 'next/link';

export default function AdminUserDetailsPage({
  params
}: {
  params: { id: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to the user list */}
      <Link href="/admin/users" className="self-start text-blue-600 underline">
        Back to Users
      </Link>
      {/* Title displays the user id for context */}
      <h1 className="text-2xl font-bold">User {params.id}</h1>
      {/* Placeholder content until implementation */}
      <p>Details view coming soon.</p>
    </div>
  );
}

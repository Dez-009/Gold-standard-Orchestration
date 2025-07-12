'use client';
// Table component for displaying users with admin controls

import { useState } from 'react';

export interface AdminUser {
  id: number;
  email: string;
  full_name?: string | null;
  role: string;
  created_at?: string;
  is_active: boolean;
}

interface Props {
  users: AdminUser[];
  onRoleChange: (id: number, role: string) => void;
  onDeactivate: (id: number) => void;
}

const roles = ['user', 'beta_tester', 'pro_user', 'admin'];

export default function UserTable({ users, onRoleChange, onDeactivate }: Props) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border divide-y divide-gray-200 text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Signup</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="odd:bg-gray-50">
              <td className="border px-4 py-2">{u.full_name ?? '-'}</td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">
                <select
                  value={u.role}
                  onChange={(e) => onRoleChange(u.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td className="border px-4 py-2">
                {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
              </td>
              <td className="border px-4 py-2">
                {u.is_active ? (
                  <button
                    onClick={() => onDeactivate(u.id)}
                    className="text-red-600 hover:underline"
                  >
                    Deactivate
                  </button>
                ) : (
                  <span className="text-gray-400">Inactive</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

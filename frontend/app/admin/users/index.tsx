'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserManagementIndex() {
  const router = useRouter();
  
  // Redirect to the user list page
  useEffect(() => {
    router.push('/admin/users');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

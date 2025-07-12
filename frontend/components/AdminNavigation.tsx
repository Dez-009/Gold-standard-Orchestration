'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const AdminNavigation = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin" className="font-bold text-xl">
                Admin Dashboard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/admin/users"
                className={`${isActive('/admin/users')} inline-flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-700`}
              >
                Users
              </Link>
              <Link 
                href="/admin/analytics"
                className={`${isActive('/admin/analytics')} inline-flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-700`}
              >
                Analytics
              </Link>
              <Link 
                href="/admin/subscriptions"
                className={`${isActive('/admin/subscriptions')} inline-flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-700`}
              >
                Subscriptions
              </Link>
              <Link 
                href="/admin/billing"
                className={`${isActive('/admin/billing')} inline-flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-700`}
              >
                Billing
              </Link>
              <Link 
                href="/admin/settings"
                className={`${isActive('/admin/settings')} inline-flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-700`}
              >
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/admin/users"
              className={`${isActive('/admin/users')} block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-700`}
            >
              Users
            </Link>
            <Link 
              href="/admin/analytics"
              className={`${isActive('/admin/analytics')} block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-700`}
            >
              Analytics
            </Link>
            <Link 
              href="/admin/subscriptions"
              className={`${isActive('/admin/subscriptions')} block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-700`}
            >
              Subscriptions
            </Link>
            <Link 
              href="/admin/billing"
              className={`${isActive('/admin/billing')} block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-700`}
            >
              Billing
            </Link>
            <Link 
              href="/admin/settings"
              className={`${isActive('/admin/settings')} block px-3 py-2 text-base font-medium rounded-md hover:bg-blue-700`}
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavigation;

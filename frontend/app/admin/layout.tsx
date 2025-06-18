'use client';
// Layout wrapping all admin pages and displaying debug status banner
import { ReactNode, useEffect, useState } from 'react';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { getDebugMode } from '../../services/apiClient';
import { showError } from '../../components/ToastProvider';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Track whether the debug banner should be shown
  const [showBanner, setShowBanner] = useState(false);

  // Check debug status on mount using the stored JWT token
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) return;
    const fetchStatus = async () => {
      try {
        const data = await getDebugMode(token);
        setShowBanner(data.debug);
      } catch {
        // Notes: Surface any failure to the user for awareness
        showError('Failed to load debug status');
      }
    };
    fetchStatus();
  }, []);

  return (
    <div>
      {showBanner && (
        <div
          className="hidden sm:flex items-center justify-between bg-yellow-100 text-yellow-800 px-4 py-2"
          data-testid="debug-banner"
        >
          <span>🛠 Debug Mode Enabled — Non-production behaviors may occur.</span>
          <button className="text-sm" onClick={() => setShowBanner(false)}>
            Dismiss
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

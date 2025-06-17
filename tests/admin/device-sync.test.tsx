// Frontend test verifying device sync page renders records
import { render, screen, waitFor } from '@testing-library/react';
import DeviceSyncLogPage from '../../frontend/app/admin/device-sync/page';

// Mock service used by the page
jest.mock('../../frontend/services/deviceSyncService', () => ({
  fetchLogs: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        user_id: 1,
        source: 'Fitbit',
        sync_status: 'success',
        synced_at: '2024-01-01T00:00:00Z',
        raw_data_preview: { steps: 1000 }
      }
    ])
  )
}));

const { fetchLogs } = require('../../frontend/services/deviceSyncService');

test('renders device sync table rows', async () => {
  render(<DeviceSyncLogPage />);
  await waitFor(() => screen.getByText('Fitbit'));
  expect(fetchLogs).toHaveBeenCalled();
  expect(screen.getByText('Fitbit')).toBeInTheDocument();
});

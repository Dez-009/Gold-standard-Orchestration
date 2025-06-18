// Frontend test verifying wearable sync log page renders rows
import { render, screen, waitFor } from '@testing-library/react';
import WearableSyncLogsPage from '../../../frontend/app/admin/wearables/sync-logs';

// Mock the wearable service used by the page
jest.mock('../../../frontend/services/wearableService', () => ({
  fetchWearableSyncLogs: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        user_id: 1,
        device_type: 'fitbit',
        sync_status: 'success',
        synced_at: '2024-01-01T00:00:00Z',
        raw_data_url: null
      }
    ])
  )
}));

const { fetchWearableSyncLogs } = require('../../../frontend/services/wearableService');

test('renders wearable sync log table', async () => {
  render(<WearableSyncLogsPage />);
  await waitFor(() => screen.getByText('fitbit'));
  expect(fetchWearableSyncLogs).toHaveBeenCalled();
  expect(screen.getByText('fitbit')).toBeInTheDocument();
});

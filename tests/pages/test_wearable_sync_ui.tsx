// Frontend test verifying wearable sync page loads and triggers sync
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WearableSyncPage from '../../frontend/app/settings/wearable-sync';

jest.mock('../../frontend/services/apiClient', () => ({
  pushWearableData: jest.fn(() =>
    Promise.resolve({ id: '1', data_type: 'sleep', value: '7', recorded_at: '2024-01-01T00:00:00Z' })
  ),
  getWearableData: jest.fn(() =>
    Promise.resolve({ data_type: 'sleep', value: '7', recorded_at: '2024-01-01T00:00:00Z', source: 'fitbit' })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false
}));

const { pushWearableData, getWearableData } = require('../../frontend/services/apiClient');

test('renders data and pushes sync', async () => {
  render(<WearableSyncPage />);
  await waitFor(() => expect(getWearableData).toHaveBeenCalled());
  fireEvent.click(screen.getByText('Manual Sync'));
  await waitFor(() => expect(pushWearableData).toHaveBeenCalled());
  expect(screen.getByText('Latest Sleep:')).toBeInTheDocument();
});

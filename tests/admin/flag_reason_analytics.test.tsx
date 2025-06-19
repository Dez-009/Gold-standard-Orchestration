// Frontend test verifying flag reason analytics page loads data
import { render, screen, waitFor } from '@testing-library/react';
import FlagReasonAnalyticsPage from '../../frontend/app/admin/flag-reasons/analytics';

jest.mock('../../frontend/services/flagReasonAnalyticsService', () => ({
  fetchFlagReasonAnalytics: jest.fn(() =>
    Promise.resolve([
      { reason: 'moderation_violation', count: 2 }
    ])
  )
}));

jest.mock('../../frontend/services/apiClient', () => ({
  getFlagReasons: jest.fn(() =>
    Promise.resolve([
      {
        id: 'r1',
        label: 'moderation_violation',
        category: 'Safety',
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { fetchFlagReasonAnalytics } = require('../../frontend/services/flagReasonAnalyticsService');

test('renders flag reason analytics row', async () => {
  render(<FlagReasonAnalyticsPage />);
  await waitFor(() => expect(fetchFlagReasonAnalytics).toHaveBeenCalled());
  expect(screen.getByText('moderation_violation')).toBeInTheDocument();
});

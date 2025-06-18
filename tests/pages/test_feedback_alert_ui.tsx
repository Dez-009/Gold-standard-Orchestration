// Frontend test verifying alert table loads and displays rows
import { render, screen, waitFor } from '@testing-library/react';
import FeedbackAlertPage from '../../frontend/app/admin/alerts/page';

jest.mock('../../frontend/services/feedbackAlertService', () => ({
  fetchFeedbackAlerts: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        user_id: 1,
        summary_id: 'abc',
        rating: 1,
        flagged_reason: 'rating_below_threshold',
        created_at: '2024-01-01T00:00:00Z',
        summary_preview: 'bad summary'
      }
    ])
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { fetchFeedbackAlerts } = require('../../frontend/services/feedbackAlertService');

test('renders alert row', async () => {
  render(<FeedbackAlertPage />);
  await waitFor(() => expect(fetchFeedbackAlerts).toHaveBeenCalled());
  expect(screen.getByText('bad summary')).toBeInTheDocument();
});

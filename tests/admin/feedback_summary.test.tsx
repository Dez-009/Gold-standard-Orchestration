// Frontend test verifying feedback summary page loads metrics
import { render, screen, waitFor } from '@testing-library/react';
import FeedbackSummaryPage from '../../frontend/app/admin/feedback/summary';

jest.mock('../../frontend/services/feedbackAnalyticsService', () => ({
  fetchFeedbackSummary: jest.fn(() =>
    Promise.resolve({
      JournalSummarizationAgent: {
        likes: 2,
        dislikes: 1,
        average_rating: 4.5,
        flagged: 3
      }
    })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { fetchFeedbackSummary } = require('../../frontend/services/feedbackAnalyticsService');

test('renders feedback summary data', async () => {
  render(<FeedbackSummaryPage />);
  await waitFor(() => expect(fetchFeedbackSummary).toHaveBeenCalled());
  expect(screen.getByText('JournalSummarizationAgent')).toBeInTheDocument();
  expect(screen.getByText('2 👍')).toBeInTheDocument();
});

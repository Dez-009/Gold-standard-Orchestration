// Frontend test verifying global insights dashboard displays metrics
import { render, screen, waitFor } from '@testing-library/react';
import GlobalInsightsPage from '../../frontend/app/admin/insights/global';

jest.mock('../../frontend/services/globalInsightsService', () => ({
  fetchGlobalInsights: jest.fn(() =>
    Promise.resolve({
      journals_last_7d: 5,
      journals_last_30d: 10,
      top_agent: 'JournalSummarizationAgent',
      top_feedback_reason: 'Bug',
      avg_mood: 3.8,
      weekly_active_users: 2
    })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { fetchGlobalInsights } = require('../../frontend/services/globalInsightsService');

test('renders global insights data', async () => {
  render(<GlobalInsightsPage />);
  await waitFor(() => expect(fetchGlobalInsights).toHaveBeenCalled());
  expect(screen.getByText('JournalSummarizationAgent')).toBeInTheDocument();
  expect(screen.getByText('Bug')).toBeInTheDocument();
});

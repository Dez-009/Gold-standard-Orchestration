// Frontend test verifying user agent usage page renders table rows
import { render, screen, waitFor } from '@testing-library/react';
import UserAgentUsagePage from '../../frontend/app/admin/users/[userId]/agents';

jest.mock('../../frontend/services/apiClient', () => ({
  getUserAgentUsageSummary: jest.fn(() =>
    Promise.resolve([
      {
        agent_name: 'JournalSummarizationAgent',
        runs: 2,
        input_tokens: 100,
        output_tokens: 20,
        cost_usd: 0.24,
        last_run: '2024-01-01T00:00:00Z'
      }
    ])
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getUserAgentUsageSummary } = require('../../frontend/services/apiClient');

test('renders user agent usage table', async () => {
  render(<UserAgentUsagePage params={{ userId: '1' }} />);
  await waitFor(() => expect(getUserAgentUsageSummary).toHaveBeenCalled());
  expect(screen.getByText('JournalSummarizationAgent')).toBeInTheDocument();
});

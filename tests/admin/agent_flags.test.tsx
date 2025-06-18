// Frontend test verifying agent flag review page loads data
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AgentFlagPage from '../../frontend/app/admin/agents/flags';

jest.mock('../../frontend/services/agentFlagService', () => ({
  fetchAgentFlags: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        agent_name: 'career',
        user_id: 1,
        reason: 'bad',
        created_at: '2024-01-01T00:00:00Z',
        reviewed: false
      }
    ])
  ),
  markAgentFlagReviewed: jest.fn(() => Promise.resolve())
}));

const { fetchAgentFlags, markAgentFlagReviewed } = require('../../frontend/services/agentFlagService');

test('renders flag rows and calls review', async () => {
  render(<AgentFlagPage />);
  await waitFor(() => screen.getByText('career'));
  expect(fetchAgentFlags).toHaveBeenCalled();
  fireEvent.click(screen.getByText('Mark Reviewed'));
  await waitFor(() => expect(markAgentFlagReviewed).toHaveBeenCalled());
});

// Frontend test verifying agent failure log page renders entries
import { render, screen, waitFor } from '@testing-library/react';
import AgentFailureLogsPage from '../../frontend/app/admin/agents/failures';

jest.mock('../../frontend/services/agentFailureLogService', () => ({
  fetchAgentFailureLogs: jest.fn(() =>
    Promise.resolve({
      results: [
        {
          id: '1',
          user_id: 1,
          agent_name: 'career',
          reason: 'timeout',
          failed_at: '2024-01-01T00:00:00Z'
        }
      ]
    })
  )
}));

const { fetchAgentFailureLogs } = require('../../frontend/services/agentFailureLogService');

test('renders failure log table rows', async () => {
  render(<AgentFailureLogsPage />);
  await waitFor(() => screen.getByText('career'));
  expect(fetchAgentFailureLogs).toHaveBeenCalled();
  expect(screen.getByText('career')).toBeInTheDocument();
});


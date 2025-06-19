// Frontend test verifying replay button triggers API call
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrchestrationPerformancePage from '../../frontend/app/admin/orchestration/logs';

jest.mock('../../frontend/services/apiClient', () => ({
  getOrchestrationLogs: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        agent_name: 'JournalSummarizationAgent',
        user_id: 1,
        execution_time_ms: 10,
        input_tokens: 5,
        output_tokens: 2,
        status: 'success',
        fallback_triggered: false,
        timeout_occurred: false,
        retries: 0,
        timestamp: '2024-01-01T00:00:00Z'
      }
    ])
  ),
  getOverrideHistory: jest.fn(() => Promise.resolve([])),
  replayOrchestration: jest.fn(() =>
    Promise.resolve({
      outputs: { summary: 'new summary', reflection: 'reflection' },
      meta: { runtime_ms: 50, error: null }
    })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getOrchestrationLogs, replayOrchestration } = require('../../frontend/services/apiClient');

test('replay button calls api and shows modal', async () => {
  render(<OrchestrationPerformancePage />);
  await waitFor(() => expect(getOrchestrationLogs).toHaveBeenCalled());
  fireEvent.click(screen.getByText('Replay'));
  await waitFor(() => expect(replayOrchestration).toHaveBeenCalledWith('header.payload.sig', '1'));
  await waitFor(() => screen.getByText('Replay Output'));
});

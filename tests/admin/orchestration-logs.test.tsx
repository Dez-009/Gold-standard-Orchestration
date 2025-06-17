// Frontend test ensuring orchestration performance page renders table rows
import { render, screen, waitFor } from '@testing-library/react';
import OrchestrationPerformancePage from '../../frontend/app/admin/orchestration/logs';

// Mock the API client used to fetch logs
jest.mock('../../frontend/services/apiClient', () => ({
  getOrchestrationLogs: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        agent_name: 'JournalSummarizationAgent',
        user_id: 1,
        execution_time_ms: 100,
        input_tokens: 50,
        output_tokens: 10,
        status: 'success',
        fallback_triggered: false,
        retries: 1,
        timeout_occurred: false,
        timestamp: '2024-01-01T00:00:00Z'
      }
    ])
  )
}));

const { getOrchestrationLogs } = require('../../frontend/services/apiClient');

test('renders orchestration performance logs', async () => {
  render(<OrchestrationPerformancePage />);
  await waitFor(() => screen.getByText('JournalSummarizationAgent'));
  expect(getOrchestrationLogs).toHaveBeenCalled();
  expect(screen.getByText('JournalSummarizationAgent')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
});

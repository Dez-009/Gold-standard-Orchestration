import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OrchestrationPerformancePage from '../../frontend/app/admin/orchestration/logs';

jest.mock('../../frontend/services/apiClient', () => ({
  getFilteredOrchestrationLogs: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        agent_name: 'Core Coach Agent',
        user_id: 1,
        execution_time_ms: 10,
        input_tokens: 5,
        output_tokens: 1,
        status: 'success',
        fallback_triggered: false,
        timeout_occurred: false,
        retries: 0,
        timestamp: '2024-01-01T00:00:00Z'
      }
    ])
  ),
  exportOrchestrationLogsCSV: jest.fn(() => Promise.resolve(new Blob()))
}));

const { getFilteredOrchestrationLogs, exportOrchestrationLogsCSV } = require('../../frontend/services/apiClient');

test('filters and exports logs', async () => {
  render(<OrchestrationPerformancePage />);
  await waitFor(() => screen.getByText('Core Coach Agent'));
  expect(getFilteredOrchestrationLogs).toHaveBeenCalled();
  fireEvent.change(screen.getByPlaceholderText('Filter by agent'), { target: { value: 'Core' } });
  fireEvent.click(screen.getByText('Export CSV'));
  await waitFor(() => expect(exportOrchestrationLogsCSV).toHaveBeenCalled());
});

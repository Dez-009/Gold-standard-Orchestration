// Frontend test verifying timeout banner and retry button
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SummaryPage from '../../frontend/app/journal/[journalId]/summary';

jest.mock('../../frontend/services/apiClient', () => ({
  orchestrateAiRequest: jest.fn(() => Promise.resolve({ error: 'timeout' }))
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false
}));

const { orchestrateAiRequest } = require('../../frontend/services/apiClient');

test('shows timeout banner and retries on click', async () => {
  render(<SummaryPage params={{ journalId: '1' }} />);
  await screen.findByText('Agent response timed out. Please try again.');
  expect(orchestrateAiRequest).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('Retry'));
  await waitFor(() => expect(orchestrateAiRequest).toHaveBeenCalledTimes(2));
});

// Frontend test verifying override page fetches history and posts reason
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OverridePage from '../../frontend/app/admin/journal-summaries/[summaryId]/override';

jest.mock('../../frontend/services/adminJournalSummaryService', () => ({
  fetchSummary: jest.fn(() =>
    Promise.resolve({
      id: '1',
      user_id: 1,
      summary_text: 'text',
      created_at: '2024-01-01T00:00:00Z'
    })
  )
}));

jest.mock('../../frontend/services/apiClient', () => ({
  getOverrideHistory: jest.fn(() =>
    Promise.resolve([
      { id: '1', timestamp: '2024-01-01T00:00:00Z', reason: 'old', run_id: '1' }
    ])
  ),
  postOverrideRun: jest.fn(() => Promise.resolve({}))
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getOverrideHistory, postOverrideRun } = require('../../frontend/services/apiClient');

test('renders history and submits override', async () => {
  render(<OverridePage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(getOverrideHistory).toHaveBeenCalled());
  expect(screen.getByText('Overridden')).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Override reason'), { target: { value: 'fix' } });
  fireEvent.click(screen.getByText('Re-run'));
  await waitFor(() => expect(postOverrideRun).toHaveBeenCalledWith('header.payload.sig', '1', 'fix'));
});

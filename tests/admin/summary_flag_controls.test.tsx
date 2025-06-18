// Frontend test verifying flag/unflag controls call API
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSummaryPage from '../../frontend/app/admin/journal-summaries/[summaryId]/page';

jest.mock('../../frontend/services/apiClient', () => ({
  flagSummary: jest.fn(() => Promise.resolve({})),
  unflagSummary: jest.fn(() => Promise.resolve({})),
  downloadSummaryPDF: jest.fn(() => Promise.resolve(new Blob())),
  retryAgent: jest.fn(() => Promise.resolve()),
  getSummaryNotes: jest.fn(() => Promise.resolve([])),
  addSummaryNote: jest.fn(() => Promise.resolve({}))
}));

jest.mock('../../frontend/services/adminJournalSummaryService', () => ({
  fetchSummary: jest.fn(() =>
    Promise.resolve({
      id: '1',
      user_id: 1,
      summary_text: 'hello',
      created_at: '2024-01-01T00:00:00Z',
      flagged: false,
      flag_reason: null
    })
  ),
  triggerRerun: jest.fn(() => Promise.resolve())
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { flagSummary, unflagSummary } = require('../../frontend/services/apiClient');
const { fetchSummary } = require('../../frontend/services/adminJournalSummaryService');

test('flag and unflag summary', async () => {
  render(<AdminSummaryPage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(fetchSummary).toHaveBeenCalled());
  fireEvent.click(screen.getByText('Flag Summary'));
  fireEvent.change(screen.getByPlaceholderText('Flag reason'), { target: { value: 'bad' } });
  fireEvent.click(screen.getByText('Confirm Flag'));
  await waitFor(() => expect(flagSummary).toHaveBeenCalled());

  // update fetchSummary to return flagged true for unflag step
  fetchSummary.mockResolvedValueOnce({
    id: '1',
    user_id: 1,
    summary_text: 'hello',
    created_at: '2024-01-01T00:00:00Z',
    flagged: true,
    flag_reason: 'bad'
  });

  fireEvent.click(screen.getByText('Remove Flag'));
  await waitFor(() => expect(unflagSummary).toHaveBeenCalled());
});

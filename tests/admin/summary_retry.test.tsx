// Frontend test verifying retry dropdown triggers API call
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSummaryPage from '../../frontend/app/admin/journal-summaries/[summaryId]/page';

jest.mock('../../frontend/services/adminJournalSummaryService', () => ({
  fetchSummary: jest.fn(() =>
    Promise.resolve({
      id: '1',
      user_id: 1,
      summary_text: 'old',
      created_at: '2024-01-01',
      admin_notes: ''
    })
  ),
  provideNotes: jest.fn(() => Promise.resolve()),
  triggerRerun: jest.fn(() => Promise.resolve())
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

jest.mock('../../frontend/services/apiClient', () => ({
  downloadSummaryPDF: jest.fn(() => Promise.resolve(new Blob())),
  retryAgent: jest.fn(() => Promise.resolve({ output: 'ok' }))
}));

const { fetchSummary } = require('../../frontend/services/adminJournalSummaryService');
const { retryAgent } = require('../../frontend/services/apiClient');

test('retry agent button calls api', async () => {
  render(<AdminSummaryPage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(fetchSummary).toHaveBeenCalled());
  fireEvent.click(screen.getByText('Retry Agent'));
  await waitFor(() => expect(retryAgent).toHaveBeenCalled());
});

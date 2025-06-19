// Frontend test verifying rerun modal triggers service
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
  downloadSummaryPDF: jest.fn(() => Promise.resolve(new Blob()))
}));

const { fetchSummary, triggerRerun } = require('../../frontend/services/adminJournalSummaryService');

test('clicking rerun shows modal and triggers rerun', async () => {
  render(<AdminSummaryPage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(fetchSummary).toHaveBeenCalled());
  fireEvent.click(screen.getByText('Rerun Agent'));
  fireEvent.click(screen.getByText('Confirm'));
  await waitFor(() => expect(triggerRerun).toHaveBeenCalledWith('1'));
});

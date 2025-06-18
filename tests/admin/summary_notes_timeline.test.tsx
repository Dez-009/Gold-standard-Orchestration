// Frontend test verifying notes timeline renders and adds note
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSummaryPage from '../../frontend/app/admin/journal-summaries/[summaryId]/page';

jest.mock('../../frontend/services/adminJournalSummaryService', () => ({
  fetchSummary: jest.fn(() =>
    Promise.resolve({
      id: '1',
      user_id: 1,
      summary_text: 'hello',
      created_at: '2024-01-01T00:00:00Z'
    })
  ),
  triggerRerun: jest.fn(() => Promise.resolve())
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

jest.mock('../../frontend/services/apiClient', () => ({
  downloadSummaryPDF: jest.fn(() => Promise.resolve(new Blob())),
  retryAgent: jest.fn(() => Promise.resolve()),
  getSummaryNotes: jest.fn(() =>
    Promise.resolve([
      { id: 'n1', author_id: 2, content: 'old', created_at: '2024-01-01T00:00:00Z' }
    ])
  ),
  addSummaryNote: jest.fn(() =>
    Promise.resolve({ id: 'n2', author_id: 2, content: 'new', created_at: '2024-01-02T00:00:00Z' })
  )
}));

const { fetchSummary } = require('../../frontend/services/adminJournalSummaryService');
const { getSummaryNotes, addSummaryNote } = require('../../frontend/services/apiClient');

test('shows notes and adds new one', async () => {
  render(<AdminSummaryPage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(fetchSummary).toHaveBeenCalled());
  await waitFor(() => expect(getSummaryNotes).toHaveBeenCalled());
  expect(screen.getByText('old')).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Add note'), { target: { value: 'new' } });
  fireEvent.click(screen.getByText('Add Note'));
  await waitFor(() => expect(addSummaryNote).toHaveBeenCalledWith('header.payload.sig', '1', 'new'));
});

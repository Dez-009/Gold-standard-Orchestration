// Frontend test verifying admin notes page saves updates
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSummaryPage from '../../frontend/app/admin/journal-summaries/[id]/page';

jest.mock('../../frontend/services/adminJournalSummaryService', () => ({
  fetchSummary: jest.fn(() => Promise.resolve({
    id: '1',
    user_id: 1,
    summary_text: 'hello',
    created_at: '2024-01-01T00:00:00Z',
    admin_notes: 'old'
  })),
  provideNotes: jest.fn(() => Promise.resolve())
}));

const { fetchSummary, provideNotes } = require('../../frontend/services/adminJournalSummaryService');

test('textarea updates state and saves notes', async () => {
  render(<AdminSummaryPage params={{ id: '1' }} />);
  await waitFor(() => expect(fetchSummary).toHaveBeenCalled());
  expect(screen.getByDisplayValue('old')).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('Admin Notes'), { target: { value: 'new note' } });
  fireEvent.click(screen.getByText('Save Notes'));
  await waitFor(() => expect(provideNotes).toHaveBeenCalledWith('1', 'new note'));
});

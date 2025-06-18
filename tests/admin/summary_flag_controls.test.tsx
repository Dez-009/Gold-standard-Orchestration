import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSummaryPage from '../../frontend/app/admin/journal-summaries/[summaryId]/page';

jest.mock('../../frontend/services/adminJournalSummaryService', () => ({
  fetchSummary: jest.fn(() =>
    Promise.resolve({
      id: '1',
      user_id: 1,
      summary_text: 'hi',
      created_at: '2024-01-01T00:00:00Z',
      admin_notes: '',
      flagged: false,
      flag_reason: null
    })
  ),
  provideNotes: jest.fn(() => Promise.resolve()),
  triggerRerun: jest.fn(() => Promise.resolve()),
  markFlag: jest.fn(() => Promise.resolve()),
  removeFlag: jest.fn(() => Promise.resolve()),
  retryAgent: jest.fn(() => Promise.resolve())
}));

const { fetchSummary, markFlag, removeFlag } = require('../../frontend/services/adminJournalSummaryService');

test('flag and unflag controls call services', async () => {
  render(<AdminSummaryPage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(fetchSummary).toHaveBeenCalled());
  fireEvent.click(screen.getByText('Flag Summary'));
  fireEvent.change(screen.getByPlaceholderText('Flag Reason'), { target: { value: 'bad' } });
  fireEvent.click(screen.getByText('Submit Flag'));
  await waitFor(() => expect(markFlag).toHaveBeenCalledWith('1', 'bad'));

  // Simulate flagged state and re-render
  (fetchSummary as jest.Mock).mockResolvedValueOnce({
    id: '1',
    user_id: 1,
    summary_text: 'hi',
    created_at: '2024-01-01T00:00:00Z',
    flagged: true,
    flag_reason: 'bad'
  });
  render(<AdminSummaryPage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(fetchSummary).toHaveBeenCalled());
  fireEvent.click(screen.getByText('Remove Flag'));
  await waitFor(() => expect(removeFlag).toHaveBeenCalledWith('1'));
});

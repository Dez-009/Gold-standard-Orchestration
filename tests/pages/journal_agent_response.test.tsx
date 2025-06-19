// Frontend test verifying timeout and retry banners render
import { render, screen } from '@testing-library/react';
import SummaryPage from '../../frontend/app/journal/[summaryId]/page';

// Mock dependencies used by the page component
jest.mock('../../frontend/services/journalSummaryService', () => ({
  fetchJournalSummary: jest.fn(() =>
    Promise.resolve({ summary: 'text', retry_count: 2, timeout_occurred: true })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetchJournalSummary } = require('../../frontend/services/journalSummaryService');

test('shows retry and timeout notice', async () => {
  render(<SummaryPage params={{ summaryId: '1' }} />);
  // Wait for the async effect to resolve
  await screen.findByText('text');
  expect(fetchJournalSummary).toHaveBeenCalled();
  expect(screen.getByText('⏱ This response was delayed')).toBeInTheDocument();
  expect(screen.getByText('🔁 This agent retried 2 times')).toBeInTheDocument();
});

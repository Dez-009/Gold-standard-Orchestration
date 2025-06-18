// Frontend test verifying the source badge on journal entry page
import { render, screen } from '@testing-library/react';
import JournalPage from '../../frontend/app/journals/[id]/page';

jest.mock('../../frontend/services/journalService', () => ({
  fetchJournalById: jest.fn(() =>
    Promise.resolve({
      id: 1,
      title: 'AI Note',
      content: 'hello',
      created_at: '2024-01-01T00:00:00',
      ai_generated: true
    })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false
}));

const { fetchJournalById } = require('../../frontend/services/journalService');

test('renders AI badge for generated entry', async () => {
  render(<JournalPage params={{ id: '1' }} />);
  await screen.findByText('AI Note');
  expect(fetchJournalById).toHaveBeenCalled();
  expect(screen.getByTestId('source-badge').textContent).toBe('🤖 AI-Generated Entry');
});


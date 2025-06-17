// Frontend test ensuring reflection prompts render when returned
import { render, screen, waitFor } from '@testing-library/react';
import JournalDetailsPage from '../../frontend/app/journals/[id]/page';

jest.mock('../../frontend/services/reflectionPromptService', () => ({
  getPromptsForUser: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        journal_id: 1,
        prompt_text: 'What made you feel this way today?',
        created_at: '2024-01-01'
      }
    ])
  ),
  ReflectionPrompt: {}
}));

jest.mock('../../frontend/services/journalService', () => ({
  fetchJournalById: jest.fn(() =>
    Promise.resolve({
      id: 1,
      title: null,
      content: 'Sample entry',
      created_at: '2024-01-01'
    })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false
}));

test('renders reflection prompt', async () => {
  render(<JournalDetailsPage params={{ id: '1' }} />);
  await waitFor(() => screen.getByText('Reflection Boost'));
  expect(
    screen.getByText('What made you feel this way today?')
  ).toBeInTheDocument();
});

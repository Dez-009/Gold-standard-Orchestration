// Frontend test verifying flagged summaries dashboard loads rows
import { render, screen, waitFor } from '@testing-library/react';
import FlaggedSummaryPage from '../../frontend/app/admin/flagged-summaries/page';

jest.mock('../../frontend/services/apiClient', () => ({
  getFlaggedSummaries: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        user_id: 1,
        flag_reason: 'moderation_violation',
        summary_text: 'bad',
        created_at: '2024-01-01T00:00:00Z',
        flagged_at: '2024-01-02T00:00:00Z'
      }
    ])
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getFlaggedSummaries } = require('../../frontend/services/apiClient');

test('renders flagged summary row', async () => {
  render(<FlaggedSummaryPage />);
  await waitFor(() => expect(getFlaggedSummaries).toHaveBeenCalled());
  expect(screen.getByText('moderation_violation')).toBeInTheDocument();
});


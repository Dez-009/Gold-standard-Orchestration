// Frontend test verifying diff page fetches and renders diff
import { render, screen, waitFor } from '@testing-library/react';
import SummaryDiffPage from '../../frontend/app/admin/journal-summaries/[summaryId]/diff';

jest.mock('../../frontend/services/apiClient', () => ({
  getSummaryDiff: jest.fn(() =>
    Promise.resolve({ summary_id: '1', diff: '<div>diff</div>' })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getSummaryDiff } = require('../../frontend/services/apiClient');

test('renders diff returned from service', async () => {
  render(<SummaryDiffPage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(getSummaryDiff).toHaveBeenCalled());
  expect(screen.getByText('Copy Diff')).toBeInTheDocument();
});


// Frontend test showing unresolved conflict flags in admin dashboard
import { render, screen, waitFor } from '@testing-library/react';
import AdminConflictsPage from '../../frontend/app/admin/conflicts/page';

jest.mock('../../frontend/services/conflictResolutionService', () => ({
  getUserConflictFlags: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        user_id: 1,
        journal_id: 1,
        conflict_type: 'work',
        summary_excerpt: 'argued with boss',
        resolution_prompt: 'talk calmly',
        resolved: false,
        created_at: '2024-01-01'
      }
    ])
  ),
  resolveFlag: jest.fn(() => Promise.resolve({}))
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

test('renders conflict flag table', async () => {
  render(<AdminConflictsPage />);
  await waitFor(() => screen.getByText('Conflict Flags'));
  expect(screen.getByText('argued with boss')).toBeInTheDocument();
});

// Frontend test verifying persona snapshot page loads traits
import { render, screen, waitFor } from '@testing-library/react';
import UserPersonaSnapshotPage from '../../frontend/app/admin/users/[userId]/persona';

jest.mock('../../frontend/services/apiClient', () => ({
  getUserPersonaSnapshot: jest.fn(() =>
    Promise.resolve({ traits: ['kind', 'curious'], last_updated: '2024-01-01T00:00:00Z' })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getUserPersonaSnapshot } = require('../../frontend/services/apiClient');

test('renders persona trait chips', async () => {
  render(<UserPersonaSnapshotPage params={{ userId: '1' }} />);
  await waitFor(() => expect(getUserPersonaSnapshot).toHaveBeenCalled());
  expect(screen.getByText('kind')).toBeInTheDocument();
});

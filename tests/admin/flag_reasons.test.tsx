// Frontend test verifying flag reasons admin page loads and creates
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FlagReasonAdminPage from '../../frontend/app/admin/flag-reasons/page';

jest.mock('../../frontend/services/apiClient', () => ({
  getFlagReasons: jest.fn(() =>
    Promise.resolve([
      {
        id: 'r1',
        label: 'Inappropriate',
        category: 'Safety',
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
  ),
  createFlagReason: jest.fn(() =>
    Promise.resolve({
      id: 'r2',
      label: 'Off-topic',
      category: 'Relevance',
      created_at: '2024-01-02T00:00:00Z'
    })
  ),
  deleteFlagReason: jest.fn(() => Promise.resolve())
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getFlagReasons, createFlagReason, deleteFlagReason } = require('../../frontend/services/apiClient');

test('renders reason row and adds new reason', async () => {
  render(<FlagReasonAdminPage />);
  await waitFor(() => expect(getFlagReasons).toHaveBeenCalled());
  expect(screen.getByText('Inappropriate')).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Label'), { target: { value: 'Off-topic' } });
  fireEvent.change(screen.getByPlaceholderText('Category'), { target: { value: 'Relevance' } });
  fireEvent.click(screen.getByText('Add'));
  await waitFor(() => expect(createFlagReason).toHaveBeenCalled());
});

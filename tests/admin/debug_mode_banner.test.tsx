// Frontend test verifying the debug banner renders in admin layout
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminLayout from '../../frontend/app/admin/layout';

jest.mock('../../frontend/services/apiClient', () => ({
  getDebugMode: jest.fn(() => Promise.resolve({ debug: true }))
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false
}));

const { getDebugMode } = require('../../frontend/services/apiClient');

test('shows and dismisses debug banner', async () => {
  render(
    <AdminLayout>
      <div>child</div>
    </AdminLayout>
  );
  await waitFor(() => expect(getDebugMode).toHaveBeenCalled());
  expect(screen.getByTestId('debug-banner')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Dismiss'));
  await waitFor(() => expect(screen.queryByTestId('debug-banner')).toBeNull());
});

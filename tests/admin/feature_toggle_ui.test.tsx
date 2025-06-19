// Frontend test verifying quick toggle UI triggers update
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import QuickToggle from '../../frontend/app/admin/features/quick-toggle';

jest.mock('../../frontend/services/apiClient', () => ({
  getFeatureFlags: jest.fn(() =>
    Promise.resolve([
      { feature_key: 'pdf_export', access_tier: 'pro', enabled: true }
    ])
  ),
  updateFeatureFlag: jest.fn(() =>
    Promise.resolve({ feature_key: 'pdf_export', access_tier: 'pro', enabled: false })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { updateFeatureFlag } = require('../../frontend/services/apiClient');

test('toggles feature from UI', async () => {
  render(<QuickToggle />);
  await waitFor(() => screen.getByText('pdf_export'));
  const cb = screen.getByRole('checkbox');
  fireEvent.click(cb);
  await waitFor(() => expect(updateFeatureFlag).toHaveBeenCalled());
});

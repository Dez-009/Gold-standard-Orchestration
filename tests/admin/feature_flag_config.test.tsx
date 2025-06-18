import { render, screen, waitFor } from '@testing-library/react';
import FeatureFlagsPage from '../../frontend/app/admin/features/page';

jest.mock('../../frontend/services/apiClient', () => ({
  getFeatureFlags: jest.fn(() =>
    Promise.resolve([
      { feature_key: 'pdf_export', access_tier: 'pro', enabled: true, updated_at: '2024-01-01T00:00:00Z' }
    ])
  ),
  updateFeatureFlag: jest.fn()
}));

const { getFeatureFlags } = require('../../frontend/services/apiClient');

test('renders feature flags table', async () => {
  render(<FeatureFlagsPage />);
  await waitFor(() => screen.getByText('pdf_export'));
  expect(getFeatureFlags).toHaveBeenCalled();
  expect(screen.getByText('pdf_export')).toBeInTheDocument();
});

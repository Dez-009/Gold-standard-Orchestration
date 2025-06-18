// Frontend test verifying FeatureGate hides content when disabled
import { render, screen } from '@testing-library/react';
import FeatureGate from '../../frontend/components/FeatureGate';

jest.mock('../../frontend/lib/useEnabledFeatures', () => ({
  __esModule: true,
  default: jest.fn()
}));

const useEnabledFeatures = require('../../frontend/lib/useEnabledFeatures').default;

test('renders children when feature enabled', () => {
  useEnabledFeatures.mockReturnValue({ pdf_export: true });
  render(
    <FeatureGate name="pdf_export">
      <div>PDF Export</div>
    </FeatureGate>
  );
  expect(screen.getByText('PDF Export')).toBeInTheDocument();
});

test('hides children when feature disabled', () => {
  useEnabledFeatures.mockReturnValue({ pdf_export: false });
  render(
    <FeatureGate name="pdf_export">
      <div>PDF Export</div>
    </FeatureGate>
  );
  expect(screen.queryByText('PDF Export')).toBeNull();
});

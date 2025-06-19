import { render, screen, waitFor } from '@testing-library/react';
import SummaryAuditPage from '../../frontend/app/admin/journal-summaries/[summaryId]/audit';

jest.mock('../../frontend/services/apiClient', () => ({
  getSummaryAuditTrail: jest.fn(() =>
    Promise.resolve([
      {
        timestamp: '2024-01-01T00:00:00Z',
        event_type: 'override',
        actor: 'admin@vida.com',
        metadata: {}
      }
    ])
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getSummaryAuditTrail } = require('../../frontend/services/apiClient');

test('renders audit trail events', async () => {
  render(<SummaryAuditPage params={{ summaryId: '1' }} />);
  await waitFor(() => expect(getSummaryAuditTrail).toHaveBeenCalled());
  expect(screen.getByText('override')).toBeInTheDocument();
});

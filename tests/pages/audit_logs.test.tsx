// Frontend test verifying audit logs page renders table
import { render, screen, waitFor } from '@testing-library/react';
import AuditLogsPage from '../../frontend/app/admin/audit-logs/page';

jest.mock('../../frontend/services/auditLogService', () => ({
  fetchAuditLogs: jest.fn(() =>
    Promise.resolve([
      {
        timestamp: '2024-01-01T00:00:00Z',
        action_type: 'AGENT_ASSIGNMENT',
        metadata: 'career',
        user_id: 1
      }
    ])
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { fetchAuditLogs } = require('../../frontend/services/auditLogService');

test('renders audit log rows', async () => {
  render(<AuditLogsPage />);
  await waitFor(() => screen.getByText('AGENT_ASSIGNMENT'));
  expect(fetchAuditLogs).toHaveBeenCalled();
  expect(screen.getByText('AGENT_ASSIGNMENT')).toBeInTheDocument();
});

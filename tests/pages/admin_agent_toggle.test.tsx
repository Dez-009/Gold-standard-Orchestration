// Frontend test verifying agent toggle table renders and toggles
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentTogglePage from '../../frontend/app/admin/agent-toggles/page';

jest.mock('../../frontend/services/apiClient', () => ({
  getAgentToggles: jest.fn(() =>
    Promise.resolve([
      { agent_name: 'career', enabled: true, updated_at: '2024-01-01' }
    ])
  ),
  updateAgentToggle: jest.fn(() =>
    Promise.resolve({
      agent_name: 'career',
      enabled: false,
      updated_at: '2024-01-02'
    })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { getAgentToggles, updateAgentToggle } = require('../../frontend/services/apiClient');

test('renders toggle table', async () => {
  render(<AgentTogglePage />);
  await waitFor(() => screen.getByText('career'));
  expect(getAgentToggles).toHaveBeenCalled();
  expect(screen.getByText('career')).toBeInTheDocument();
});

test('updates toggle', async () => {
  render(<AgentTogglePage />);
  await waitFor(() => screen.getByText('career'));
  fireEvent.click(screen.getByRole('checkbox'));
  await waitFor(() => expect(updateAgentToggle).toHaveBeenCalled());
});

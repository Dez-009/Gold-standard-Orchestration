import { render, screen, waitFor } from '@testing-library/react';
import AgentAccessMatrixPage from '../../frontend/app/admin/agents/access';

jest.mock('../../frontend/services/agentAccessService', () => ({
  fetchAccessConfig: jest.fn(() =>
    Promise.resolve([{ agent_name: 'career', access_tier: 'pro' }])
  ),
  saveAccessTier: jest.fn()
}));

const { fetchAccessConfig } = require('../../frontend/services/agentAccessService');

test('renders agent access config table', async () => {
  render(<AgentAccessMatrixPage />);
  await waitFor(() => screen.getByText('career'));
  expect(fetchAccessConfig).toHaveBeenCalled();
  expect(screen.getByText('career')).toBeInTheDocument();
});

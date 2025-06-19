// Frontend test ensuring agent access page renders rules table
import { render, screen, waitFor } from '@testing-library/react';
import AgentAccessPage from '../../frontend/app/admin/agent-access/page';

jest.mock('../../frontend/services/agentAccessService', () => ({
  fetchAgentAccessRules: jest.fn(() =>
    Promise.resolve([
      { agent: 'career', role: 'user' },
      { agent: 'GoalSuggestionAgent', role: 'pro_user' }
    ])
  )
}));

const { fetchAgentAccessRules } = require('../../frontend/services/agentAccessService');

test('renders agent access rules', async () => {
  render(<AgentAccessPage />);
  await waitFor(() => screen.getByText('GoalSuggestionAgent'));
  expect(fetchAgentAccessRules).toHaveBeenCalled();
  expect(screen.getByText('GoalSuggestionAgent')).toBeInTheDocument();
});

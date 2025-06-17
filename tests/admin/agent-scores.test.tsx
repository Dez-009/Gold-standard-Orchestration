// Frontend test verifying agent scores page loads data
import { render, screen, waitFor } from '@testing-library/react';
import AgentScoresPage from '../../frontend/app/admin/agent-scores/page';

// Mock service used by the page
jest.mock('../../frontend/services/agentScoringService', () => ({
  fetchAgentScores: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        user_id: 1,
        agent_name: 'career',
        completeness_score: 0.9,
        clarity_score: 0.8,
        relevance_score: 0.7,
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
  )
}));

const { fetchAgentScores } = require('../../frontend/services/agentScoringService');

test('renders scoring table rows', async () => {
  render(<AgentScoresPage />);
  await waitFor(() => screen.getByText('career'));
  expect(fetchAgentScores).toHaveBeenCalled();
  expect(screen.getByText('career')).toBeInTheDocument();
});

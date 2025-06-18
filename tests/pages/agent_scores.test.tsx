// Frontend test verifying self score page renders table
import { render, screen, waitFor } from '@testing-library/react';
import AgentSelfScorePage from '../../frontend/app/admin/agent-scores/page';

jest.mock('../../frontend/services/agentScoreService', () => ({
  fetchSelfScores: jest.fn(() =>
    Promise.resolve([
      { id: '1', agent_name: 'career', summary_id: 'abc', user_id: 1, self_score: 0.8, created_at: '2024-01-01T00:00:00Z' }
    ])
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { fetchSelfScores } = require('../../frontend/services/agentScoreService');

test('renders self score rows', async () => {
  render(<AgentSelfScorePage />);
  await waitFor(() => expect(fetchSelfScores).toHaveBeenCalled());
  expect(screen.getByText('career')).toBeInTheDocument();
});


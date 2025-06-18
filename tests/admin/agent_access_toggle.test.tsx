// Frontend test verifying access toggle matrix renders and updates
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AccessPage from '../../frontend/app/admin/agents/access';

jest.mock('../../frontend/services/agentAccessService', () => ({
  fetchAccessPolicies: jest.fn(() =>
    Promise.resolve([
      { agent_name: 'career', subscription_tier: 'free', is_enabled: true },
      { agent_name: 'career', subscription_tier: 'premium', is_enabled: false }
    ])
  ),
  saveAccessPolicy: jest.fn(() => Promise.resolve())
}));

const { fetchAccessPolicies, saveAccessPolicy } = require('../../frontend/services/agentAccessService');

test('renders policy table and triggers update', async () => {
  render(<AccessPage />);
  await waitFor(() => screen.getByText('career'));
  expect(fetchAccessPolicies).toHaveBeenCalled();
  const cb = screen.getAllByRole('checkbox')[0];
  fireEvent.click(cb);
  await waitFor(() => expect(saveAccessPolicy).toHaveBeenCalled());
});



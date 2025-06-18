// Frontend test verifying prompt version page renders table and saves new record
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromptVersionPage from '../../frontend/app/admin/prompts/page';

jest.mock('../../frontend/services/promptService', () => ({
  fetchPromptVersions: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        agent_name: 'career',
        version: 'v1',
        metadata: { tags: ['base'] },
        created_at: '2024-01-01',
        prompt_template: 'hi'
      }
    ])
  ),
  createPromptVersion: jest.fn(() =>
    Promise.resolve({
      id: '2',
      agent_name: 'career',
      version: 'v2',
      metadata: {},
      created_at: '2024-01-02',
      prompt_template: 'new'
    })
  )
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const { fetchPromptVersions, createPromptVersion } = require('../../frontend/services/promptService');

test('renders versions and saves new one', async () => {
  render(<PromptVersionPage />);
  await waitFor(() => screen.getByText('v1'));
  expect(fetchPromptVersions).toHaveBeenCalled();
  fireEvent.click(screen.getByText('Add Version'));
  fireEvent.change(screen.getByPlaceholderText('Agent Name'), { target: { value: 'career' } });
  fireEvent.change(screen.getByPlaceholderText('Version'), { target: { value: 'v2' } });
  fireEvent.change(screen.getByPlaceholderText('Prompt Template'), { target: { value: 'new' } });
  fireEvent.change(screen.getByPlaceholderText('Metadata JSON'), { target: { value: '{}' } });
  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(createPromptVersion).toHaveBeenCalled());
});

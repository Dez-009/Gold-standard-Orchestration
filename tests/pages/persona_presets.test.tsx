// Frontend test verifying persona preset page loads presets
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PersonaPresetPage from '../../frontend/app/admin/persona-presets/page';

jest.mock('../../frontend/services/personaPresetService', () => ({
  fetchPersonaPresets: jest.fn(() =>
    Promise.resolve([
      { id: '1', name: 'Friendly', description: 'desc', traits: { empathy: 0.9 }, created_at: '2024-01-01' }
    ])
  ),
  savePersonaPreset: jest.fn(() => Promise.resolve({ id: '2', name: 'Test', description: '', traits: {}, created_at: '2024-01-02' })),
  modifyPersonaPreset: jest.fn(() => Promise.resolve({ id: '1', name: 'Friendly', description: 'updated', traits: { empathy: 0.9 }, created_at: '2024-01-01' })),
  removePersonaPreset: jest.fn(() => Promise.resolve({}))
}));

jest.mock('../../frontend/services/authUtils', () => ({
  getToken: () => 'header.payload.sig',
  isTokenExpired: () => false,
  isAdmin: () => true
}));

const {
  fetchPersonaPresets,
  savePersonaPreset,
  modifyPersonaPreset,
  removePersonaPreset
} = require('../../frontend/services/personaPresetService');

test('renders preset list and saves new preset', async () => {
  render(<PersonaPresetPage />);
  await waitFor(() => screen.getByText('Friendly'));
  expect(fetchPersonaPresets).toHaveBeenCalled();
  fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test' } });
  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(savePersonaPreset).toHaveBeenCalled());
});


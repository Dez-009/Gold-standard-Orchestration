// Frontend test for the admin persona token page
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserPersonaTokenPage from '../frontend/app/admin/users/[id]/persona';

jest.mock('../frontend/services/personaTokenService', () => ({
  addPersonaToken: jest.fn(() => Promise.resolve({})),
  getUserPersonaToken: jest.fn(() => Promise.resolve({ token_name: 'deep_reflector' }))
}));

const { addPersonaToken } = require('../frontend/services/personaTokenService');

test('saving persona token triggers service call', async () => {
  render(<UserPersonaTokenPage params={{ id: '1' }} />);
  await screen.findByText('Current token: deep_reflector');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'quick_rebounder' } });
  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(addPersonaToken).toHaveBeenCalled());
});

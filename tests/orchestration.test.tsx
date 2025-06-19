// Frontend test for the orchestration page
// Uses React Testing Library to validate UI behavior

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrchestrationPage from '../frontend/app/orchestration/page';

// Mock the orchestration service used by the page
jest.mock('../frontend/services/orchestrationService', () => ({
  askVida: jest.fn(() => Promise.resolve('mock response'))
}));

const { askVida } = require('../frontend/services/orchestrationService');

// Notes: Basic test ensuring a prompt triggers the API call
it('submits user prompt and displays response', async () => {
  render(<OrchestrationPage />);
  fireEvent.change(screen.getByPlaceholderText('Ask Vida anything...'), {
    target: { value: 'hello' }
  });
  fireEvent.click(screen.getByText('Ask Vida'));
  expect(askVida).toHaveBeenCalledWith('hello');
  await waitFor(() => screen.getByText('mock response'));
});

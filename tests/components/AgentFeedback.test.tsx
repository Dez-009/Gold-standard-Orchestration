// Frontend test validating feedback submission flow
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentFeedback from '../../frontend/components/AgentFeedback';

jest.mock('../../frontend/services/agentFeedbackService', () => ({
  fetchAgentFeedback: jest.fn(() => Promise.reject({ response: { status: 404 } })),
  submitAgentFeedback: jest.fn(() => Promise.resolve({}))
}));

const { submitAgentFeedback } = require('../../frontend/services/agentFeedbackService');

test('submits selected reaction', async () => {
  render(<AgentFeedback summaryId="1" />);
  fireEvent.click(screen.getByText('👍'));
  fireEvent.change(screen.getByPlaceholderText('Additional thoughts (optional)'), {
    target: { value: 'nice' }
  });
  fireEvent.click(screen.getByText('Submit'));
  await waitFor(() => expect(submitAgentFeedback).toHaveBeenCalled());
});


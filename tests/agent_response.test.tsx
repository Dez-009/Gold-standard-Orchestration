// Frontend unit test verifying timeout fallback UI
import { render, screen } from '@testing-library/react';
import AgentResponse from '../frontend/components/AgentResponse';

test('renders timeout fallback', () => {
  render(
    <AgentResponse
      reply={{ agent: 'summary', status: 'timeout', content: 'This agent took too long to respond.' }}
      loading={false}
      onRetry={() => {}}
    />
  );
  expect(screen.getByText('⚠️ This response was delayed. Try again later.')).toBeInTheDocument();
});

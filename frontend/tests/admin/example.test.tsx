import { render } from '@testing-library/react';
import React from 'react';

test('admin sample test', () => {
  const { container } = render(<div>Admin</div>);
  expect(container.textContent).toBe('Admin');
});

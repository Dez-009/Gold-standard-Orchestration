import { render } from '@testing-library/react';
import React from 'react';
import AdminUserDetailsPage from '../../frontend/app/admin/users/[id]/page';

test('renders placeholder user details page', () => {
  const { container } = render(<AdminUserDetailsPage params={{ id: '123' }} />);
  expect(container.textContent).toContain('User 123');
});

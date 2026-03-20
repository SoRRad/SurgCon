import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  'react-router-dom',
  () => ({
    HashRouter: ({ children }) => <div>{children}</div>,
    Navigate: () => null,
    Route: ({ element }) => element,
    Routes: ({ children }) => <>{children}</>,
    NavLink: ({ children, to, className }) => (
      <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className}>
        {children}
      </a>
    ),
    Link: ({ children, to, className }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
    useParams: () => ({ conferenceId: 'acs-clinical-congress' }),
  }),
  { virtual: true }
);

test('renders SurgCon platform heading', () => {
  render(<App />);
  const headingElement = screen.getByText(
    /SurgCon brings surgical conferences and academic collaboration into one platform/i
  );
  expect(headingElement).toBeInTheDocument();
});

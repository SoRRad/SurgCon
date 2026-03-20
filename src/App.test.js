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
    useLocation: () => ({ pathname: '/' }),
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

test('renders SurgCon home experience', () => {
  render(<App />);
  expect(
    screen.getByText(/A modern surgical conference platform for discovery, deadlines, bookmarks, exports, and maintainable data review/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/Developed by/i)).toBeInTheDocument();
});

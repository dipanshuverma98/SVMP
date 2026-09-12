import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SVMP platform landing page', () => {
  render(<App />);
  const headingElement = screen.getByText(/Student Virtual Mentorship Platform/i);
  expect(headingElement).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders brand title', () => {
  render(<App />);
  const brand = screen.getByText(/CAD AI Analyzer/i);
  expect(brand).toBeInTheDocument();
});

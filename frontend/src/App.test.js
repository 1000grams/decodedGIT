import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders hero headline', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const headline = screen.getByRole('heading', { name: /Decoded Music/i });
  expect(headline).toBeInTheDocument();
});

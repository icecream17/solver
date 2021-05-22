import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
   render(<App />);
})

test('it renders', () => {
   expect(true).toBe(true)
})

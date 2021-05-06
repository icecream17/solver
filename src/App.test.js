import { render, screen } from '@testing-library/react';
import App from './App';

render(<App />);

describe('app', () => {
   test('it renders', () => {
      expect(true).toBe(true)
   })
})

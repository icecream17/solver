import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import Cell from './Elems/MainElems/Cell';
import { IndexToNine, SudokuDigits } from './Types';
import { forComponentsToUpdate } from './utils';

beforeEach(() => {
   render(<App />);
})

test('it renders', () => {
   expect(true).toBe(true)
})

// Explicit implicit checks //
test('getting the main element', () => {
   expect(screen.getByRole('main')).toBeInTheDocument()
})

test('a header exists', () => {
   expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})

test("Strategy sections exist", () => {
   expect(screen.getByRole('group', { name: 'strategies' })).toBeInTheDocument()
   expect(screen.getByRole('group', { name: 'controls' })).toBeInTheDocument()
})

// Silly test
test("Click everything", () => {
   for (const element of document.querySelectorAll("*")) {
      userEvent.click(element)
   }
})

test.todo("Strategy control testing")

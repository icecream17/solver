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

// The name === 'Sudoku' because aria-label === 'Sudoku'
test('getting the sudoku table', () => {
   expect(screen.getByRole('table', { name: 'Sudoku' })).toBeInTheDocument()
})

function getSudokuTableElement () {
   return screen.getByRole('table', { name: 'Sudoku' })
}

function getTableCellElement (row: IndexToNine, column: IndexToNine) {
   return getButtonCellElement(row, column).parentElement as HTMLElement
}

// The actual handler
function getButtonCellElement(row: IndexToNine, column: IndexToNine) {
   return screen.getByRole('button', { name: Cell.labelAt(row, column) })
}

const cellTests = [
   [0, 0],
   [0, 1],
   [1, 1],
   [1, 2],
   [5, 0],
   [8, 7],
   [3, 4],
   [6, 2],
   [4, 5]
] as const

test.each(cellTests)('getting the cell at row %i, column %i', (row, column) => {
   expect(getTableCellElement(row, column)).toBeInTheDocument()
   expect(getButtonCellElement(row, column)).toBeInTheDocument()
})

// If the way the buttonCell is highlighted is changed, update this test
// Right now it's by data-active
test("Focused buttonCells are highlighted", () => {
   const buttonCell = getButtonCellElement(0, 0)
   expect(buttonCell).not.toHaveAttribute('data-active')
   userEvent.click(buttonCell)
   expect(buttonCell).toHaveAttribute('data-active')
   fireEvent.blur(buttonCell)
   expect(buttonCell).not.toHaveAttribute('data-active')
})

test("Setting a cell to a digit", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('1')
   expect(buttonCell).toHaveTextContent('1')
})

test("Setting a cell to multiple candidates", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('1234567')
   expect(buttonCell).toHaveTextContent('1234567')
})

test("Clearing all candidates of a cell", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('{Backspace}')
   fireEvent.blur(buttonCell)

   // Shows 0
   expect(buttonCell).toHaveTextContent('0')

   // Is error
   expect(buttonCell).toHaveAttribute('data-error')
})

test("Resetting the candidates", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('{Backspace}123') // 123 to prevent false negatives if backspace doesn't work
   userEvent.keyboard('{Shift>}{Backspace}{/Shift}')
   fireEvent.blur(buttonCell)

   // Is not error
   expect(buttonCell).not.toHaveAttribute('data-error')

   userEvent.click(buttonCell)
   userEvent.keyboard('{Shift>}{Backspace}{/Shift}')
   userEvent.keyboard('123')
   fireEvent.blur(buttonCell)

   expect(buttonCell).toHaveTextContent('456789')
})

test("Cell keyboard navigation", () => {
   const cornerCell = getButtonCellElement(0, 8)
   userEvent.click(cornerCell)

   // Tab !== Right
   // In this case, in goes into the next row
   userEvent.tab()
   expect(getButtonCellElement(1, 0)).toHaveFocus()

   function tryKey(keyboard: string, row: IndexToNine, column: IndexToNine) {
      userEvent.keyboard(keyboard)
      expect(getButtonCellElement(row, column)).toHaveFocus()
   }

   tryKey('{ArrowLeft}', 1, 8)
   tryKey('{ArrowLeft}', 1, 7)
   tryKey('{ArrowUp}', 0, 7)
   tryKey('{ArrowUp}', 8, 7)
   tryKey('{ArrowDown}', 0, 7)
   tryKey('{ArrowRight}', 0, 8)
   tryKey('{ArrowRight}', 0, 0)
})

function setCell (x: IndexToNine, y: IndexToNine) {
   return {
      to(...candidates: SudokuDigits[]) {
         const cell = getButtonCellElement(x, y)
         userEvent.click(cell)
         userEvent.keyboard(candidates.join(''))
         fireEvent.blur(cell)
      }
   }
}

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

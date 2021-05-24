import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import Cell from './Elems/MainElems/Cell';
import { IndexToNine } from './Types';

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

// function getSudokuTableElement () {
//    return screen.getByRole('table', { name: 'Sudoku' })
// }

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

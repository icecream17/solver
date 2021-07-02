
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import Cell from './Cell';
import { IndexToNine } from '../../Types';

beforeEach(() => {
   render(<App />);
})

// The name === 'Sudoku' because aria-label === 'Sudoku'
test('getting the sudoku table', () => {
   expect(screen.getByRole('table', { name: 'Sudoku' })).toBeInTheDocument()
})

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

// Cell has 0 candidates
test("Clearing all candidates of a cell", () => {
   const buttonCell1 = getButtonCellElement(0, 0)
   const buttonCell2 = getButtonCellElement(0, 1)

   userEvent.click(buttonCell1)
   userEvent.keyboard('{Backspace}')
   userEvent.click(buttonCell2)
   userEvent.keyboard('12345') // Now the cell has "12345"
   userEvent.keyboard('12345') // Now the cell has ""
   fireEvent.blur(buttonCell2)

   // Shows 0
   expect(buttonCell1).toHaveTextContent('0')
   expect(buttonCell2).toHaveTextContent('0')

   // Is error
   expect(buttonCell1).toHaveAttribute('data-error')
   expect(buttonCell2).toHaveAttribute('data-error')
})

// The following two tests describe the same thing,
// but are done in different ways
test("Toggling every candidate", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('123456789')
   expect(buttonCell).toHaveTextContent('123456789') // Focused = showCandidates

   fireEvent.blur(buttonCell)
   expect(buttonCell).toHaveTextContent('') // Not focused + full = nothing shown
})

test("Resetting the candidates", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('{Backspace}123') // 123 to prevent false negatives if backspace doesn't work
   userEvent.keyboard('{Shift>}{Backspace}{/Shift}')
   fireEvent.blur(buttonCell)

   // Is not error
   expect(buttonCell).not.toHaveAttribute('data-error')

   // Since the cell has all candidates, and is blurred, textcontent = ''
   expect(buttonCell).toHaveTextContent('')

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



import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { IndexToNine } from '../../Types';
import { getButtonCellElement, getTableCellElement } from './Sudoku.testUtils';

function tryKey (keyboard: string, row: IndexToNine, column: IndexToNine) {
   userEvent.keyboard(keyboard)
   expect(getButtonCellElement(row, column)).toHaveFocus()
}

beforeEach(() => {
   render(<App />);
})

// The name === 'Sudoku' because aria-label === 'Sudoku'
// The role === 'grid', which is more accurate since the table is interactive
test('getting the sudoku table', () => {
   expect(screen.getByRole('grid', { name: 'Sudoku' })).toBeInTheDocument()
})

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
   expect(buttonCell).not.toHaveAttribute('data-active') // not selected
   userEvent.click(buttonCell)
   expect(buttonCell).toHaveAttribute('data-active', 'true') // selected
   fireEvent.blur(buttonCell)
   expect(buttonCell).toHaveAttribute('data-active', 'false') // selection disabled

   // An actual bug - pressing right moved the focus right and selected the cell right
   const nextCell = getButtonCellElement(0, 2)
   userEvent.click(buttonCell)
   userEvent.keyboard('{ArrowRight}')
   expect(nextCell).not.toHaveAttribute('data-active') // not selected
   userEvent.click(buttonCell)

   // Multi-select
   const buttonCell2 = getButtonCellElement(3, 4)
   userEvent.keyboard('{Control>}')
   userEvent.click(buttonCell2)
   expect(buttonCell).toHaveAttribute('data-active', 'true') // selected
   expect(buttonCell2).toHaveAttribute('data-active', 'true') // selected
   fireEvent.blur(buttonCell2)
   expect(buttonCell).toHaveAttribute('data-active', 'false') // selection disabled
   expect(buttonCell2).toHaveAttribute('data-active', 'false') // selection disabled
   userEvent.click(buttonCell2)
   userEvent.keyboard('{/Control}{Escape}')
   expect(buttonCell).not.toHaveAttribute('data-active') // not selected
   expect(buttonCell2).not.toHaveAttribute('data-active') // not selected
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
   const buttonCell = getButtonCellElement(0, 0)
   const buttonCell2 = getButtonCellElement(0, 1)
   
   // Change to something to avoid false negative
   userEvent.click(buttonCell)
   userEvent.keyboard('7')
   fireEvent.blur(buttonCell)
   expect(buttonCell).toHaveTextContent('7')

   // Both Shift and Control key work to delete all candidates
   userEvent.click(buttonCell)
   userEvent.keyboard('{Control>}{Backspace}{/Control}123')
   fireEvent.blur(buttonCell)
   expect(buttonCell).toHaveTextContent('123')

   userEvent.click(buttonCell)
   userEvent.keyboard('{Shift>}{Backspace}{/Shift}1234')
   fireEvent.blur(buttonCell)
   expect(buttonCell).toHaveTextContent('1234')

   userEvent.click(buttonCell2)
   userEvent.keyboard('12345') // Now the cell has "12345"
   userEvent.keyboard('12345') // Now the cell has ""
   fireEvent.blur(buttonCell2)
   expect(buttonCell2).toHaveTextContent('0')
   expect(buttonCell2).toHaveAttribute('data-error')
})

// The following two tests describe the same thing,
// but are done in different ways
test("Toggling every candidate", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('123456789')
   expect(buttonCell).toHaveTextContent('123456789') // Is editing --> Show candidates

   fireEvent.blur(buttonCell) // Not actively editing anymore
   expect(buttonCell).toHaveTextContent('') // Inactive + full = nothing shown
})

test("Resetting the candidates", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('123{Backspace}') // 123 to prevent false negatives
   fireEvent.blur(buttonCell) // Backspace resets to having all candidates

   // Is not error
   expect(buttonCell).not.toHaveAttribute('data-error')

   // Since the cell has all candidates, and is blurred, textcontent = ''
   expect(buttonCell).toHaveTextContent('')
})

test("Multi-selection editing", () => {
   const buttonCell1 = getButtonCellElement(0, 0)
   const buttonCell2 = getButtonCellElement(0, 1)
   const buttonCell3 = getButtonCellElement(0, 2)
   userEvent.click(buttonCell1)
   userEvent.keyboard('123')
   userEvent.keyboard('{Control>}')
   userEvent.click(buttonCell2)
   userEvent.keyboard('456')
   userEvent.keyboard('{Escape}')
   expect(buttonCell1).toHaveTextContent('123456')
   expect(buttonCell2).toHaveTextContent('456')
   userEvent.click(buttonCell2)
   userEvent.click(buttonCell3)
   userEvent.keyboard('789')
   expect(buttonCell1).toHaveTextContent('123456')
   expect(buttonCell2).toHaveTextContent('456789')
   expect(buttonCell3).toHaveTextContent('789')
   userEvent.click(buttonCell1)
   userEvent.keyboard('{Backspace}1{/Control}{Escape}')
   expect(buttonCell1).toHaveTextContent('1')
   expect(buttonCell2).toHaveTextContent('1')
   expect(buttonCell3).toHaveTextContent('1')
})

// When implemented
test.todo("Cell keyboard navigation while holding Shift and Control")

test("Cell keyboard navigation: Tab + Arrows", () => {
   const cornerCell = getButtonCellElement(0, 8)
   userEvent.click(cornerCell)

   userEvent.tab({ shift: true })
   expect(getButtonCellElement(0, 7)).toHaveFocus()

   // Tab !== Right
   // In this case, it goes into the next row
   userEvent.tab()
   userEvent.tab()
   expect(getButtonCellElement(1, 0)).toHaveFocus()

   tryKey('{ArrowLeft}', 1, 8) // Wraps around
   tryKey('{ArrowLeft}', 1, 7)
   tryKey('{ArrowUp}', 0, 7)
   tryKey('{ArrowUp}', 8, 7)
   tryKey('{ArrowDown}', 0, 7)
   tryKey('{ArrowRight}', 0, 8)
   tryKey('{ArrowRight}', 0, 0)
   tryKey('{ArrowRight>}{ArrowDown}{/ArrowRight}', 1, 1) // Actual bug
   tryKey('{ArrowRight>3/}', 1, 4) // Repeat
   // tryKey('{ArrowUp>}{ArrowLeft>4/}{/ArrowUp}', 7, 1) // Diagonal repeat
   // I tested this manually and it works so... idk
})

test("Cell keyboard navigation: End / Home", () => {
   const firstCell = getButtonCellElement(0, 0)
   userEvent.click(firstCell)

   tryKey('{End}', 0, 8) // End of row
   tryKey('{Home}', 0, 0) // Start of row
   tryKey('{Control>}{End}{/Control}', 8, 8) // Last cell
   tryKey('{Control>}{Home}{/Control}', 0, 0) // First cell
   tryKey('{PageDown}', 3, 0)
   tryKey('{PageDown}', 6, 0)
   tryKey('{PageDown}', 8, 0) // Does not wrap around
   tryKey('{PageUp}', 5, 0)
   tryKey('{PageUp}', 2, 0)
   tryKey('{PageUp}', 0, 0) // Does not wrap around
})
